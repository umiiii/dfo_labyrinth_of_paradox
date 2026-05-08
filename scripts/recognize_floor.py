"""Recognize a single labyrinth screenshot and convert it to a Floor JSON.

Usage:
    python scripts/recognize_floor.py [image_filename]

If no filename is given, defaults to "演示文稿2_68.png".
Output is written to data/floors/recognized_<floor_id>.json so the manually
crafted lab1_f1.json is not clobbered.
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
from pathlib import Path

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    SystemMessage,
    TextBlock,
    UserMessage,
    query,
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
OUT_DIR = PROJECT_ROOT / "data" / "floors"
ICONS_PATH = PROJECT_ROOT / "data" / "icons.json"

# Use the locally logged-in Claude Code credentials by inheriting parent env.


def derive_floor_id(stem: str) -> str:
    m = re.search(r"(\d+)$", stem)
    if m:
        n = int(m.group(1))
        if 68 <= n <= 77:
            return f"lab1_f{n - 67}"
        if 78 <= n <= 87:
            return f"lab2_f{n - 77}"
        if 88 <= n <= 97:
            return f"lab3_f{n - 87}"
    return re.sub(r"[^A-Za-z0-9_]+", "_", stem)


def build_prompt(image_path: Path, floor_id: str, icons_json: str) -> str:
    return f"""You are given a screenshot of a single labyrinth floor from a game called \"悖论迷宫\".
Use the Read tool to open the image at this absolute path:
{image_path}

After reading the image, output ONE fenced ```json``` code block containing a Floor JSON object matching this schema (no other prose before or after):

{{
  "schema_version": 1,
  "floor_id": "{floor_id}",
  "name": "<short Chinese title, e.g. 悖论迷宫: 第1区域 - <短描述>>",
  "grid": {{ "cols": 7, "rows": 5 }},
  "nodes": [
    {{ "row": <0..rows-1>, "col": <0..cols-1>, "icon_id": "<id>", "tier": "<optional>" }}
  ],
  "edges": [
    {{ "from": [<row>, <col>], "to": [<row>, <col>] }}
  ]
}}

Hard rules:
1. Grid origin is top-left: row 0 is the top row, col 0 is the leftmost column.
2. Nodes are sparse — declare ONLY cells that visibly contain a node icon. Empty cells are omitted.
3. icon_id MUST be one of the keys in this dictionary (each entry's "id" field equals its key):

{icons_json}

4. Tier rules:
   - If the icon definition has only "fixed"/"hover" keys, omit "tier" (default = fixed).
   - If the icon defines tiers (uncommon / rare / unique / legendary / epic / primeval), pick the tier matching the visible color or rarity frame.
   - For "labyrinth_supply_base" use tier "ticket" if the icon shows a ticket/coupon, "key" if it shows a key.
5. Edges — only include connections that are visibly drawn but NOT covered by these defaults:
   - same-row neighbors (every adjacent declared pair in the same row is auto-connected)
   - middle column where col == 3 (every adjacent declared pair in col 3 is auto-connected)
   So edges[] should only contain extra vertical or diagonal connections you actually see in the image and that don't fall under the two defaults above.
6. Output ONLY a single ```json ... ``` fenced block — no extra commentary.
"""


def extract_json(text: str) -> dict:
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    raw = fenced.group(1) if fenced else None
    if raw is None:
        m = re.search(r"(\{[\s\S]*\})", text)
        if not m:
            raise ValueError("no JSON object found in model output")
        raw = m.group(1)
    return json.loads(raw)


async def run_one(image_path: Path) -> Path:
    if not image_path.is_file():
        raise FileNotFoundError(image_path)

    floor_id = derive_floor_id(image_path.stem)
    out_path = OUT_DIR / f"recognized_{floor_id}.json"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    icons_json = ICONS_PATH.read_text(encoding="utf-8")

    options = ClaudeAgentOptions(
        cwd=str(PROJECT_ROOT),
        permission_mode="bypassPermissions",
        allowed_tools=["Read"],
        max_turns=6,
        stderr=lambda line: print(f"[cli stderr] {line}", file=sys.stderr),
    )

    prompt = build_prompt(image_path, floor_id, icons_json)

    final_text = ""
    async for msg in query(prompt=prompt, options=options):
        if isinstance(msg, AssistantMessage):
            for block in msg.content:
                if isinstance(block, TextBlock) and block.text.strip():
                    final_text = block.text
        elif isinstance(msg, ResultMessage):
            print(
                f"[done] turns={msg.num_turns} "
                f"duration={msg.duration_ms}ms "
                f"cost=${msg.total_cost_usd}"
            )
            if msg.is_error:
                print(f"[error] {msg.result}", file=sys.stderr)
        elif isinstance(msg, SystemMessage):
            if msg.subtype == "init":
                print(f"[init] model={msg.data.get('model')}")
        elif isinstance(msg, UserMessage):
            pass

    if not final_text:
        raise RuntimeError("model returned no text")

    payload = extract_json(final_text)
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[wrote] {out_path}")
    return out_path


async def main() -> None:
    arg = sys.argv[1] if len(sys.argv) > 1 else "演示文稿2_68.png"
    image_path = (SRC_DIR / arg).resolve()
    await run_one(image_path)


if __name__ == "__main__":
    asyncio.run(main())
