import os
from pathlib import Path
from abc import ABC
from typing import Dict, Optional, Tuple
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_PATH = [
    os.path.join(BASE_DIR, 'myapp/aimedical/.env'),
]

class RuntimeEnv(ABC):
    """Class responsible for managing run time settings."""

    ENV_DEFAULT: Dict[str, Tuple[str, ...]] = {
        "input": ("SERVER_INPUT_ENDPOINT", "myapp/aimedical/cloud-server/int-dataset"),
        "output": ("SERVER_OUTPUT_ENDPOINT", "myapp/aimedical/cloud-server/out-dataset"),
        "model": ("SERVER_MODEL_ENDPOINT", "venv/lib/site-packages/monai"),
        "workdir": ("SERVER_WORKING_DIRECTORY", ""),
    }
    input: str = ""
    output: str = ""
    model: str = ""
    workdir: str = ""

    def __init__(self, defaults: Optional[Dict[str, Tuple[str, ...]]] = None, runEnv: bool = False):
        if defaults is None or (runEnv is False or runEnv is None):
            defaults = self.ENV_DEFAULT
        else:
            load_dotenv(dotenv_path=ENV_PATH[0])

        for key, (env, default) in defaults.items():
            setattr(self, key, os.environ.get(env, default))



