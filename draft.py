import os
import os.path
from os.path import abspath
import logging
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import asyncio
from pathlib import Path
from abc import ABC
from pathlib import Path
from typing import Any, Dict, ItemsView, List, Optional, Tuple, Type, Union
from .model import Model
from monai.deploy.exceptions import ItemNotExistsError, UnknownTypeError
import argparse
import json
import logging.config
from pathlib import Path
from monai.deploy.utils import argparse_types
from monai.deploy.operators.monai_seg_inference_operator import InfererType, InMemImageReader, MonaiSegInferenceOperato
from monai.transforms import (
    Activationsd,
    AsDiscreted,
    Compose,
    CropForegroundd,
    EnsureChannelFirstd,
    Invertd,
    LoadImaged,
    ScaleIntensityRanged,
    Spacingd,
)


LOG_CONFIG_FILENAME = "logging.json"

# Store all supported model types in the order they should be checked
REGISTERED_MODELS = []

class ModelFactory:
    """ModelFactory is a class that provides a way to create a model object."""

    @staticmethod
    def create(path: Union[str, Path], name: str = "", model_type: str = "") -> Optional[Model]:
        """Creates a model object.

        Args:
            path (Union[str, Path]): A path to the model.
            name (str): A name of the model.
            model_type (str): A type of the model.

        Returns:
            A model object. Returns None if the model file/folder does not exist.
        """
        model_type, model_cls = ModelFactory.detect_model_type(path, model_type)

        if model_type and model_cls:
            model = model_cls(str(path), name)
            return model
        else:
            return None

    @staticmethod
    def detect_model_type(path: Union[str, Path], model_type: str = "") -> Tuple[str, Optional[Type[Model]]]:
        """Detects the model type based on a model path.

        Args:
            path (Union[str, Path]): A path to the model file/folder.
            model_type (str): A model type.

        Returns:
            A tuple of the model type string and the model class.
        """
        path = Path(path)

        for model_cls in Model.registered_models():
            # If a model_type is specified, check if it matches the model type.
            if model_type and model_cls.model_type != model_type:
                continue

            accept, model_type = model_cls.accept(path)
            if accept:
                return model_type, model_cls

        return "", None



class Model:
    """Represents a model or a model repository.

    This encapsulates model's name and path.

    If this presents a model repository, repository's name and path are accessed via 'name' and 'path' attributes.

    If this presents a model, the model's name and path are accessed via 'name' and 'path' attributes.

    If the model's path is not specified(`Model("")`), the model is considered as a null model
    and `bool(Model("")) == False`.

    All models that this class represents can be retrieved by using `items()` method and a model with specific name
    can be retrieved by `get()` method with a model name argument (If only one model is available, you can skip
    specifying the model name).

    Loaded model object can be accessed via 'predictor' attribute and the predictor can be called
    using `__call__` method.

    In the `Operator` class, A model is accessible via `context.models` attribute inside `compute` method.
    Some subclasses (such as TorchModel) loads model file when `predictor` attribute is accessed so you can
    call(`__call__`) the model directly.

    >>> class MyOperator(Operator):
    >>>     def compute(self, op_input: InputContext, op_output: OutputContext, context: ExecutionContext):
    >>>         model = context.models.get()
    >>>         result = model(op_input.get().asnumpy())

    If you want to load a model file manually, please set 'predictor' attribute to a loaded model object.

    >>> class MyOperator(Operator):
    >>>     def compute(self, op_input: InputContext, op_output: OutputContext, context: ExecutionContext):
    >>>         import torch
    >>>         model = context.models.get()
    >>>         model.predictor = torch.jit.load(model.path, map_location="cpu").eval()
    >>>         result = model(op_input.get().asnumpy())

    Supported model types can be registered using static 'register' method.
    """

    model_type: str = "generic"

    def __init__(self, path: str, name: str = ""):
        """Constructor of a model.

        If name is not provided, the model name is taken from the path.
        `_predicator` is set to None and it is expected to be set by the child class when needed.
        `_items` is set to an dictionary having itself ({self.name: self}) and it is expected to be cleared
        by the child class if the path presents a model repository.

        Args:
            path (str): A path to a model.
            name (str): A name of the model.
        """

        self._path = path

        if name:
            self._name = name
        else:
            self._name = Path(path).stem

        self._predictor = None

        # Add self to the list of models
        self._items: Dict[str, Model] = {self.name: self}

    @property
    def predictor(self):
        """Return a predictor of the model.

        Returns:
            A predictor of the model.
        """
        return self._predictor

    @predictor.setter
    def predictor(self, predictor: Any):
        """Set a predictor of the model.

        Args:
            predictor: A predictor of the model.
        """
        self._predictor = predictor

    @property
    def path(self):
        """Return a path to the model."""
        return self._path

    @property
    def name(self):
        """Return a name of the model."""
        return self._name

    @classmethod
    def class_name(cls):
        """Return a name of the model class."""
        return cls.__name__

    @staticmethod
    def register(cls_list):
        """Register a list of model classes."""
        global REGISTERED_MODELS
        REGISTERED_MODELS = cls_list

    @staticmethod
    def registered_models():
        """Return a list of registered model classes."""
        return REGISTERED_MODELS

    @classmethod
    def accept(cls, path: str) -> Tuple[bool, str]:
        """Check if the path is a type of this model class.

        Args:
            path (str): A path to a model.

        Returns:
            (True, <model_type>) if the path is a type of this model class, (False, "") otherwise.
        """
        if not os.path.exists(path):
            return False, ""
        return True, cls.model_type

    def get(self, name: str = "") -> "Model":
        """Return a model object by name.

        If there is only one model in the repository or the model path, model object can be returned without specifying
        name.

        If there are more than one models in the repository, the model object can be returned by name whose name
        matches the provided name.

        Args:
            name (str): A name of the model.

        Returns:
            A model object is returned, matching the provided name if given.
        """
        if name:
            item = self._items.get(name)
            if item:
                return item
            else:
                raise ItemNotExistsError(f"A model with {name!r} does not exist.")
        else:
            item_count = len(self._items)
            if item_count == 1:
                return next(iter(self._items.values()))
            elif item_count > 1:
                raise UnknownTypeError(
                    f"There are more than one model. It should be one of ({', '.join(self._items.keys())})."
                )
            else:
                return self

    def get_model_list(self) -> List[Dict[str, str]]:
        """Return a list of models in the repository.

        If this model represents a model repository, then a list of model objects (name and path) is returned.
        Otherwise, a single model object list is returned.

        Returns:
            A list of models (name, path dictionary) in the repository.
        """
        model_list = []
        model_items = self.items()

        for _, m in model_items:
            model_list.append({"name": m.name, "path": os.path.abspath(m.path)})

        return model_list

    def items(self) -> ItemsView[str, "Model"]:
        """Return an ItemsView of models that this Model instance has.

        If this model represents a model repository, then an ItemsView of submodel objects is returned.
        Otherwise, an ItemsView of a single model object (self) is returned.

        Returns:
            An ItemView of models: `<model name>: <model object>`.
        """
        return self._items.items()

    def __call__(self, *args, **kwargs) -> Any:
        """Return a call of predictor of the model.

        Args:
            *args: A list of positional arguments.
            **kwargs: A dictionary of keyword arguments.

        Returns:
            A call of predictor of the model.

        Exceptions:
            ItemNotExistsError: If the predictor(model) is not set.
        """
        if self.predictor:
            return self.predictor(*args, **kwargs)
        else:
            raise ItemNotExistsError("A predictor of the model is not set.")

    def __bool__(self):
        """Return True if the model path is specified."""
        return bool(self.path)


"""
#THE MONAI DEPLOYMENT SDK RUNTIME DEPENDENT ON NVIDIA Holoscan SDK
#OBMIBUS APP RUNTIME DEPENDENT ON EC2 INSTANCE
"""
class RuntimeEnv(ABC):

    ENV_DEFAULT: Dict[str, Tuple[str, ...]] = {
        "input": ("static-root/cloud-server", "int-dataset"),
        "output": ("static-root/cloud-server", "out-dataset"),
        "model": ("venv+Lib+site_package", "models"),
        "workdir": ("basedir", ""),
    }

    input: str = ""
    output: str = ""
    model: str = ""
    workdir: str = ""


    base_dir+

    def __init__(self, defaults: Optional[Dict[str, Tuple[str, ...]]] = None):
        if defaults is None:
            defaults = self.ENV_DEFAULT
        for key, (env, default) in defaults.items():
            self.__dict__[key] = os.environ.get(env, default)




def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parses the arguments passed to the application.

    Args:
        argv (Optional[List[str]], optional): The command line arguments to parse.
            The first item should be the path to the python executable.
            If not specified, ``sys.argv`` is used. Defaults to None.

    Returns:
        argparse.Namespace: parsed arguments.
    """
    if argv is None:
        import sys

        argv = sys.argv
    argv = list(argv)  # copy argv for manipulation to avoid side-effects

    # We have intentionally not set the default using `default="INFO"` here so that the default
    # value from here doesn't override the value in `LOG_CONFIG_FILENAME` unless the user indends to do
    # so. If the user doesn't use this flag to set log level, this argument is set to "None"
    # and the logging level specified in `LOG_CONFIG_FILENAME` is used.
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        "-l",
        "--log-level",
        dest="log_level",
        type=str.upper,
        choices=["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"],
        help="Set the logging level (default: INFO)",
    )
    parser.add_argument(
        "--input", "-i", type=argparse_types.valid_existing_path, help="Path to input folder/file (default: input)"
    )
    parser.add_argument(
        "--output", "-o", type=argparse_types.valid_dir_path, help="Path to output folder (default: output)"
    )
    parser.add_argument(
        "--model", "-m", type=argparse_types.valid_existing_path, help="Path to model(s) folder/file (default: models)"
    )
    parser.add_argument(
        "--workdir",
        "-w",
        type=argparse_types.valid_dir_path,
        help="Path to workspace folder (default: A temporary '.monai_workdir' folder in the current folder)",
    )

    args = parser.parse_args(argv[1:])
    args.argv = argv  # save argv for later use in runpy

    return args


def set_up_logging(level: Optional[str], config_path: Union[str, Path] = LOG_CONFIG_FILENAME):
    """Initializes the logger and sets up logging level.

    Args:
        level (str): A logging level (DEBUG, INFO, WARN, ERROR, CRITICAL).
        log_config_path (str): A path to logging config file.
    """
    # Default log config path
    log_config_path = Path(__file__).absolute().parent.parent / LOG_CONFIG_FILENAME

    config_path = Path(config_path)

    # If a logging config file that is specified by `log_config_path` exists in the current folder,
    # it overrides the default one
    if config_path.exists():
        log_config_path = config_path

    config_dict = json.loads(log_config_path.read_bytes())

    if level is not None and "root" in config_dict:
        config_dict["root"]["level"] = level
    logging.config.dictConfig(config_dict)




class AppContext(object):
    """A class to store the context of an application."""

    def __init__(self, args: Dict[str, str], runtime_env: Optional[RuntimeEnv] = None):
        # Set the args
        self.args: Dict[str, str] = {}
        # Set the runtime environment
        self.runtime_env = runtime_env or RuntimeEnv()

        self._model_loaded = False  # If it has tried to load the models.
        self.model_path = ""  # To be set next.
        self.update(args)

    def update(self, args: Dict[str, str]):
        """Update the context with new args and runtime_env."""
        # Update args
        self.args.update(args)

        # Set the path to input/output/model
        self.input_path = args.get("input") or self.args.get("input") or self.runtime_env.input
        self.output_path = args.get("output") or self.args.get("output") or self.runtime_env.output
        self.workdir = args.get("workdir") or self.args.get("workdir") or self.runtime_env.workdir

        # If model has not been loaded, or the model path has changed, get the path and load model(s)
        old_model_path = self.model_path
        self.model_path = args.get("model") or self.args.get("model") or self.runtime_env.model
        if old_model_path != self.model_path:
            self._model_loaded = False  # path changed, reset the flag to re-load

        if not self._model_loaded:
            self.models: Optional[Model] = ModelFactory.create(abspath(self.model_path))
            self._model_loaded = True

    def __repr__(self):
        return (
            f"AppContext(input_path={self.input_path}, output_path={self.output_path}, "
            f"model_path={self.model_path}, workdir={self.workdir})"
        )


def init_app_context(argv: Optional[List[str]] = None, runtime_env: Optional[RuntimeEnv] = None) -> AppContext:
    """Initializes the app context with arguments and well-known environment variables.

    The arguments, if passed in, override the attributes set with environment variables.

    Args:
        argv (Optional[List[str]], optional): arguments passed to the program. Defaults to None.

    Returns:
        AppContext: the AppContext object
    """

    args = parse_args(argv)
    set_up_logging(args.log_level)
    logging.info(f"Parsed args: {args}")

    # The parsed args from the command line override that from the environment variables
    app_context = AppContext({key: val for key, val in vars(args).items() if val}, runtime_env)
    logging.info(f"AppContext object: {app_context}")

    return app_context


# from monai.transforms import SaveImaged  # If saving input and seg images uding inference is needed.
# from numpy import uint8  # Needed if SaveImaged is enabled


#######################################


###########################
# Copyright 2021-2023 MONAI Consortium
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from typing import Any, Dict, Tuple, Union

from monai.deploy.core import Fragment, Image, Operator


class InferenceOperator(Operator):
    """The base operator for operators that perform AI inference.

    This operator preforms pre-transforms on a input image, inference with
    a given model, post-transforms, and final results generation.
    """

    def __init__(self, *args, **kwargs):
        """Constructor of the operator."""
        super().__init__(*args, **kwargs)

    # @abstractmethod
    def pre_process(self, data: Any, *args, **kwargs) -> Union[Image, Any, Tuple[Any, ...], Dict[Any, Any]]:
        """Transforms input before being used for predicting on a model.

        This method must be overridden by a derived class.

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """

        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")

    # @abstractmethod
    def compute(self, op_input, op_output, context):
        """An abstract method that needs to be implemented by the user.

        Args:
            op_input (InputContext): An input context for the operator.
            op_output (OutputContext): An output context for the operator.
            context (ExecutionContext): An execution context for the operator.
        """
        pass

    # @abstractmethod
    def predict(self, data: Any, *args, **kwargs) -> Union[Image, Any, Tuple[Any, ...], Dict[Any, Any]]:
        """Predicts results using the models(s) with input tensors.

        This method must be overridden by a derived class.

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """
        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")

    # @abstractmethod
    def post_process(self, data: Any, *args, **kwargs) -> Union[Image, Any, Tuple[Any, ...], Dict[Any, Any]]:
        """Transform the prediction results from the model(s).

        This method must be overridden by a derived class.

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """
        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")


# Copyright 2021-2023 MONAI Consortium
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import os
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

import numpy as np

from monai.deploy.utils.importutil import optional_import
from monai.utils import StrEnum  # Will use the built-in StrEnum when SDK requires Python 3.11.

MONAI_UTILS = "monai.utils"
torch, _ = optional_import("torch", "1.5")
np_str_obj_array_pattern, _ = optional_import("torch.utils.data._utils.collate", name="np_str_obj_array_pattern")
Dataset, _ = optional_import("monai.data", name="Dataset")
DataLoader, _ = optional_import("monai.data", name="DataLoader")
ImageReader_, image_reader_ok_ = optional_import("monai.data", name="ImageReader")
# Dynamic class is not handled so make it Any for now: https://github.com/python/mypy/issues/2477
ImageReader: Any = ImageReader_
if not image_reader_ok_:
    ImageReader = object  # for 'class InMemImageReader(ImageReader):' to work
decollate_batch, _ = optional_import("monai.data", name="decollate_batch")
sliding_window_inference, _ = optional_import("monai.inferers", name="sliding_window_inference")
simple_inference, _ = optional_import("monai.inferers", name="SimpleInferer")
ensure_tuple, _ = optional_import(MONAI_UTILS, name="ensure_tuple")
MetaKeys, _ = optional_import(MONAI_UTILS, name="MetaKeys")
SpaceKeys, _ = optional_import(MONAI_UTILS, name="SpaceKeys")
Compose_, _ = optional_import("monai.transforms", name="Compose")
# Dynamic class is not handled so make it Any for now: https://github.com/python/mypy/issues/2477
Compose: Any = Compose_

from monai.deploy.core import AppContext, ConditionType, Image, #OperatorSpec, #Fragment, 

from .inference_operator import InferenceOperator

__all__ = ["MonaiSegInferenceOperator", "InfererType", "InMemImageReader"]


class InfererType(StrEnum):
    """Represents the supported types of the inferer, e.g. Simple and Sliding Window."""

    SIMPLE = "simple"
    SLIDING_WINDOW = "sliding_window"


# @md.env(pip_packages=["monai>=1.0.0", "torch>=1.10.2", "numpy>=1.21"])
class MonaiSegInferenceOperator(InferenceOperator):
    """This segmentation operator uses MONAI transforms and Sliding Window Inference.

    This operator preforms pre-transforms on a input image, inference
    using a given model, and post-transforms. The segmentation image is saved
    as a named Image object in memory.

    If specified in the post transforms, results may also be saved to disk.

    Named Input:
        image: Image object of the input image.

    Named Output:
       seg_image: Image object of the segmentation image. Not requiring a ready receiver.
    """

    # For testing the app directly, the model should be at the following path.
    # THIS MIGHT BE DOCKER IMAGE
    MODEL_LOCAL_PATH = Path(os.environ.get("EC2_MODEL_ENDPOINT", Path.cwd() / "model/model.ts"))

    def __init__(
        self,
        #fragment: Fragment,
        *args,
        roi_size: Optional[Union[Sequence[int], int]],
        pre_transforms: Compose,
        post_transforms: Compose,
        app_context: AppContext,
        model_name: Optional[str] = "",
        overlap: float = 0.25,
        sw_batch_size: int = 4,
        inferer: Union[InfererType, str] = InfererType.SLIDING_WINDOW,
        model_path: Path = MODEL_LOCAL_PATH,
        **kwargs,
    ):
        """Creates a instance of this class.

        Args:
            fragment (Fragment): An instance of the Application class which is derived from Fragment.
            roi_size (Union[Sequence[int], int]): The window size to execute "SLIDING_WINDOW" evaluation.
                                                  An optional input only to be passed for "SLIDING_WINDOW".
                                                  If using a "SIMPLE" Inferer, this input is ignored.
            pre_transforms (Compose): MONAI Compose object used for pre-transforms.
            post_transforms (Compose): MONAI Compose object used for post-transforms.
            app_context (AppContext): Object holding the I/O and model paths, and potentially loaded models.
            model_name (str, optional): Name of the model. Default to "" for single model app.
            overlap (float): The amount of overlap between scans along each spatial dimension. Defaults to 0.25.
                             Applicable for "SLIDING_WINDOW" only.
            sw_batch_size(int): The batch size to run window slices. Defaults to 4.
                                Applicable for "SLIDING_WINDOW" only.
            inferer (InfererType): The type of inferer to use, "SIMPLE" or "SLIDING_WINDOW". Defaults to "SLIDING_WINDOW".
            model_path (Path): Path to the model file. Defaults to model/models.ts of current working dir.
        """

        self._logger = logging.getLogger("{}.{}".format(__name__, type(self).__name__))
        self._executing = False
        self._lock = Lock()
        self._input_dataset_key = "image"
        self._pred_dataset_key = "pred"
        self._input_image = None  # Image will come in when compute is called.
        self._reader: Any = None
        self._roi_size = ensure_tuple(roi_size)
        self._pre_transform = pre_transforms
        self._post_transforms = post_transforms
        self._model_name = model_name.strip() if isinstance(model_name, str) else ""
        self._overlap = overlap
        self._sw_batch_size = sw_batch_size
        self._inferer = inferer

        # Add this so that the local model path can be set from the calling app
        self.model_path = model_path
        self.input_name_image = "image"
        self.output_name_seg = "seg_image"

        # The execution context passed in on compute does not have the required model info, so need to
        # get and keep the model via the AppContext obj on construction.
        self.app_context = app_context

        self.model = self._get_model(self.app_context, self.model_path, self._model_name)

        super().__init__(*args, **kwargs)

    def _get_model(self, app_context: AppContext, model_path: Path, model_name: str):
        """Load the model with the given name from context or model path

        Args:
            app_context (AppContext): The application context object holding the model(s)
            model_path (Path): The path to the model file, as a backup to load model directly
            model_name (str): The name of the model, when multiples are loaded in the context
        """

        if app_context.models:
            # `app_context.models.get(model_name)` returns a model instance if exists.
            # If model_name is not specified and only one model exists, it returns that model.
            model = app_context.models.get(model_name)
        else:
            self._logger.info(f"Loading TorchScript model from: {model_path!r}")
            model = torch.jit.load(
                self.model_path,
                map_location=torch.device("cuda" if torch.cuda.is_available() else "cpu"),
            )

        return model

    def setup(self):
        spec.input(self.input_name_image)
        spec.output(self.output_name_seg).condition(ConditionType.NONE)  # Downstream receiver optional.

    @property
    def roi_size(self):
        """The ROI size of tensors used in prediction."""
        return self._roi_size

    @roi_size.setter
    def roi_size(self, roi_size: Union[Sequence[int], int]):
        self._roi_size = ensure_tuple(roi_size)

    @property
    def input_dataset_key(self):
        """This is the input image key name used in dictionary based MONAI pre-transforms."""
        return self._input_dataset_key

    @input_dataset_key.setter
    def input_dataset_key(self, val: str):
        if not val or len(val) < 1:
            raise ValueError("Value cannot be None or blank.")
        self._input_dataset_key = val

    @property
    def pred_dataset_key(self):
        """This is the prediction key name used in dictionary based MONAI post-transforms."""
        return self._pred_dataset_key

    @pred_dataset_key.setter
    def pred_dataset_key(self, val: str):
        if not val or len(val) < 1:
            raise ValueError("Value cannot be None or blank.")
        self._pred_dataset_key = val

    @property
    def overlap(self):
        """This is the overlap used during sliding window inference"""
        return self._overlap

    @overlap.setter
    def overlap(self, val: float):
        if val < 0 or val > 1:
            raise ValueError("Overlap must be between 0 and 1.")
        self._overlap = val

    @property
    def sw_batch_size(self):
        """The batch size to run window slices"""
        return self._sw_batch_size

    @sw_batch_size.setter
    def sw_batch_size(self, val: int):
        if not isinstance(val, int) or val < 0:
            raise ValueError("sw_batch_size must be a positive integer.")
        self._sw_batch_size = val

    @property
    def inferer(self) -> Union[InfererType, str]:
        """The type of inferer to use"""
        return self._inferer

    @inferer.setter
    def inferer(self, val: InfererType):
        if not isinstance(val, InfererType):
            raise ValueError(f"Value must be of the correct type {InfererType}.")
        self._inferer = val

    def _convert_dicom_metadata_datatype(self, metadata: Dict):
        """Converts metadata in pydicom types to the corresponding native types.

        It is known that some values of the metadata are of the pydicom types, for images converted
        from DICOM series. Need to use this function to convert the types with best effort and for
        the few knowns metadata attributes, until the following issue is addressed:
            https://github.com/Project-MONAI/monai-deploy-app-sdk/issues/185

        Args:
            metadata (Dict): The metadata for an Image object
        """

        if not metadata:
            return metadata

        # Try to convert data type for the well knowned attributes. Add more as needed.
        if metadata.get("SeriesInstanceUID", None):
            try:
                metadata["SeriesInstanceUID"] = str(metadata["SeriesInstanceUID"])
            except Exception:
                pass
        if metadata.get("row_pixel_spacing", None):
            try:
                metadata["row_pixel_spacing"] = float(metadata["row_pixel_spacing"])
            except Exception:
                pass
        if metadata.get("col_pixel_spacing", None):
            try:
                metadata["col_pixel_spacing"] = float(metadata["col_pixel_spacing"])
            except Exception:
                pass

        self._logger.info("Converted Image object metadata:")
        for k, v in metadata.items():
            self._logger.info(f"{k}: {v}, type {type(v)}")

        return metadata

    def compute(self, op_input, op_output, context):
        """Infers with the input image and save the predicted image to output

        Args:
            op_input (InputContext): An input context for the operator.
            op_output (OutputContext): An output context for the operator.
            context (ExecutionContext): An execution context for the operator.
        """

        with self._lock:
            if self._executing:
                raise RuntimeError("Operator is already executing.")
            else:
                self._executing = True
        try:
            input_image = op_input.receive(self.input_name_image)
            if not input_image:
                raise ValueError("Input is None.")
            op_output.emit(self.compute_impl(input_image, context), self.output_name_seg)
        finally:
            # Reset state on completing this method execution.
            with self._lock:
                self._executing = False

    def compute_impl(self, input_image, context):
        if not input_image:
            raise ValueError("Input is None.")

        # Need to try to convert the data type of a few metadata attributes.
        input_img_metadata = self._convert_dicom_metadata_datatype(input_image.metadata())
        # Need to give a name to the image as in-mem Image obj has no name.
        img_name = str(input_img_metadata.get("SeriesInstanceUID", "Img_in_context"))

        pre_transforms: Compose = self._pre_transform
        post_transforms: Compose = self._post_transforms
        self._reader = InMemImageReader(input_image)

        pre_transforms = self._pre_transform if self._pre_transform else self.pre_process(self._reader)
        post_transforms = self._post_transforms if self._post_transforms else self.post_process(pre_transforms)

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        dataset = Dataset(data=[{self._input_dataset_key: img_name}], transform=pre_transforms)
        dataloader = DataLoader(
            dataset, batch_size=1, shuffle=False, num_workers=0
        )  # Should the batch_size be dynamic?

        with torch.no_grad():
            for d in dataloader:
                images = d[self._input_dataset_key].to(device)
                if self._inferer == InfererType.SLIDING_WINDOW:
                    d[self._pred_dataset_key] = sliding_window_inference(
                        inputs=images,
                        roi_size=self._roi_size,
                        sw_batch_size=self.sw_batch_size,
                        overlap=self.overlap,
                        predictor=self.model,
                    )
                elif self._inferer == InfererType.SIMPLE:
                    # Instantiates the SimpleInferer and directly uses its __call__ function
                    d[self._pred_dataset_key] = simple_inference()(inputs=images, network=self.model)
                else:
                    raise ValueError(
                        f"Unknown inferer: {self._inferer!r}. Available options are "
                        f"{InfererType.SLIDING_WINDOW!r} and {InfererType.SIMPLE!r}."
                    )

                d = [post_transforms(i) for i in decollate_batch(d)]
                out_ndarray = d[0][self._pred_dataset_key].cpu().numpy()
                # Need to squeeze out the channel dim fist
                out_ndarray = np.squeeze(out_ndarray, 0)
                # NOTE: The domain Image object simply contains a Arraylike obj as image as of now.
                #       When the original DICOM series is converted by the Series to Volume operator,
                #       using pydicom pixel_array, the 2D ndarray of each slice has index order HW, and
                #       when all slices are stacked with depth as first axis, DHW. In the pre-transforms,
                #       the image gets transposed to WHD and used as such in the inference pipeline.
                #       So once post-transforms have completed, and the channel is squeezed out,
                #       the resultant ndarray for the prediction image needs to be transposed back, so the
                #       array index order is back to DHW, the same order as the in-memory input Image obj.
                out_ndarray = out_ndarray.T.astype(np.uint8)
                self._logger.info(f"Output Seg image numpy array shaped: {out_ndarray.shape}")
                self._logger.info(f"Output Seg image pixel max value: {np.amax(out_ndarray)}")

                return Image(out_ndarray, input_img_metadata)

    def pre_process(self, data: Any, *args, **kwargs) -> Union[Any, Image, Tuple[Any, ...], Dict[Any, Any]]:
        """Transforms input before being used for predicting on a model.

        This method must be overridden by a derived class.
        Expected return is monai.transforms.Compose.

        Args:
            data(monai.data.ImageReader): Reader used in LoadImage to load `monai.deploy.core.Image` as the input.

        Returns:
            monai.transforms.Compose encapsulating pre transforms

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """
        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")

    def post_process(self, data: Any, *args, **kwargs) -> Union[Any, Image, Tuple[Any, ...], Dict[Any, Any]]:
        """Transforms the prediction results from the model(s).

        This method must be overridden by a derived class.
        Expected return is monai.transforms.Compose.

        Args:
            data(monai.transforms.Compose): The pre-processing transforms in a Compose object.

        Returns:
            monai.transforms.Compose encapsulating post-processing transforms.

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """
        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")

    def predict(self, data: Any, *args, **kwargs) -> Union[Image, Any, Tuple[Any, ...], Dict[Any, Any]]:
        """Predicts results using the models(s) with input tensors.

        This method is currently not used in this class, instead monai.inferers.sliding_window_inference is used.

        Raises:
            NotImplementedError: When the subclass does not override this method.
        """
        raise NotImplementedError(f"Subclass {self.__class__.__name__} must implement this method.")


class InMemImageReader(ImageReader):
    """Converts the App SDK Image object from memory.

    This is derived from MONAI ImageReader. Instead of reading image from file system, this
    class simply converts a in-memory SDK Image object to the expected formats from ImageReader.

    The loaded data array will be in C order, for example, a 3D image NumPy array index order
    will be `WHDC`. The actual data array loaded is to be the same as that from the
    MONAI ITKReader, which can also load DICOM series. Furthermore, all Readers need to return the
    array data the same way as the NibabelReader, i.e. a numpy array of index order WHDC with channel
    being the last dim if present. More details are in the get_data() function.


    """

    def __init__(self, input_image: Image, channel_dim: Optional[int] = None, **kwargs):
        super().__init__()
        self.input_image = input_image
        self.kwargs = kwargs
        self.channel_dim = channel_dim

    def verify_suffix(self, filename: Union[Sequence[str], str]) -> bool:
        return True

    def read(self, data: Union[Sequence[str], str], **kwargs) -> Union[Sequence[Any], Any]:
        # Really does not have anything to do. Simply return the Image object
        return self.input_image

    def get_data(self, input_image):
        """Extracts data array and meta data from loaded image and return them.

        This function returns two objects, first is numpy array of image data, second is dict of meta data.
        It constructs `affine`, `original_affine`, and `spatial_shape` and stores them in meta dict.
        A single image is loaded with a single set of metadata as of now.

        The App SDK Image asnumpy() function is expected to return a numpy array of index order `DHW`.
        This is because in the DICOM series to volume operator pydicom Dataset pixel_array is used to
        to get per instance pixel numpy array, with index order of `HW`. When all instances are stacked,
        along the first axis, the Image numpy array's index order is `DHW`. ITK array_view_from_image
        and SimpleITK GetArrayViewFromImage also returns a numpy array with the index order of `DHW`.
        The channel would be the last dim/index if present. In the ITKReader get_data(), this numpy array
        is then transposed, and the channel axis moved to be last dim post transpose; this is to be
        consistent with the numpy returned from NibabelReader get_data().

        The NibabelReader loads NIfTI image and uses the get_fdata() function of the loaded image to get
        the numpy array, which has the index order in WHD with the channel being the last dim if present.

        Args:
            input_image (Image): an App SDK Image object.
        """

        img_array: List[np.ndarray] = []
        compatible_meta: Dict = {}

        for i in ensure_tuple(input_image):
            if not isinstance(i, Image):
                raise TypeError("Only object of Image type is supported.")

            # The Image asnumpy() returns NumPy array similar to ITK array_view_from_image
            # The array then needs to be transposed, as does in MONAI ITKReader, to align
            # with the output from Nibabel reader loading NIfTI files.
            data = i.asnumpy().T
            img_array.append(data)
            header = self._get_meta_dict(i)
            _copy_compatible_dict(header, compatible_meta)

        # Stacking image is not really needed, as there is one image only.
        return _stack_images(img_array, compatible_meta), compatible_meta

    def _get_meta_dict(self, img: Image) -> Dict:
        """
        Gets the metadata of the image and converts to dict type.

        Args:
            img: A SDK Image object.
        """
        img_meta_dict: Dict = img.metadata()
        meta_dict = {key: img_meta_dict[key] for key in img_meta_dict.keys()}

        # Will have to derive some key metadata as the SDK Image lacks the necessary interfaces.
        # So, for now have to get to the Image generator, namely DICOMSeriesToVolumeOperator, and
        # rely on its published metadata.

        # Referring to the MONAI ITKReader, the spacing is simply a NumPy array from the ITK image
        # GetSpacing, in WHD.
        meta_dict["spacing"] = np.asarray(
            [
                img_meta_dict["row_pixel_spacing"],
                img_meta_dict["col_pixel_spacing"],
                img_meta_dict["depth_pixel_spacing"],
            ]
        )

        # Use define metadata kyes directly
        meta_dict[MetaKeys.ORIGINAL_AFFINE] = np.asarray(img_meta_dict.get("nifti_affine_transform", None))
        meta_dict[MetaKeys.AFFINE] = meta_dict[MetaKeys.ORIGINAL_AFFINE].copy()
        meta_dict[MetaKeys.SPACE] = SpaceKeys.LPS  # not using SpaceKeys.RAS or affine_lps_to_ras
        # The spatial shape, again, referring to ITKReader, it is the WHD
        meta_dict[MetaKeys.SPATIAL_SHAPE] = np.asarray(img.asnumpy().T.shape)
        # Well, no channel as the image data shape is forced to the the same as spatial shape
        meta_dict[MetaKeys.ORIGINAL_CHANNEL_DIM] = "no_channel"

        return meta_dict


# Reuse MONAI code for the derived ImageReader
def _copy_compatible_dict(from_dict: Dict, to_dict: Dict):
    if not isinstance(to_dict, dict):
        raise ValueError(f"to_dict must be a Dict, got {type(to_dict)}.")
    if not to_dict:
        for key in from_dict:
            datum = from_dict[key]
            if isinstance(datum, np.ndarray) and np_str_obj_array_pattern.search(datum.dtype.str) is not None:
                continue
            to_dict[key] = datum
    else:
        affine_key, shape_key = MetaKeys.AFFINE, MetaKeys.SPATIAL_SHAPE
        if affine_key in from_dict and not np.allclose(from_dict[affine_key], to_dict[affine_key]):
            raise RuntimeError(
                "affine matrix of all images should be the same for channel-wise concatenation. "
                f"Got {from_dict[affine_key]} and {to_dict[affine_key]}."
            )
        if shape_key in from_dict and not np.allclose(from_dict[shape_key], to_dict[shape_key]):
            raise RuntimeError(
                "spatial_shape of all images should be the same for channel-wise concatenation. "
                f"Got {from_dict[shape_key]} and {to_dict[shape_key]}."
            )


def _stack_images(image_list: List, meta_dict: Dict):
    if len(image_list) <= 1:
        return image_list[0]
    if meta_dict.get(MetaKeys.ORIGINAL_CHANNEL_DIM, None) not in ("no_channel", None):
        channel_dim = int(meta_dict[MetaKeys.ORIGINAL_CHANNEL_DIM])
        return np.concatenate(image_list, axis=channel_dim)
    # stack at a new first dim as the channel dim, if `'original_channel_dim'` is unspecified
    meta_dict[MetaKeys.ORIGINAL_CHANNEL_DIM] = 0
    return np.stack(image_list, axis=0)






class LiverTumorSegOperator():
    """Performs liver and tumor segmentation using a DL model with an image converted from a DICOM CT series.

    The model used in this application is from NVIDIA, and includes configurations for both the pre and post
    transforms as well as inferer. The MONAI Core transforms are used, as such, these transforms are
    simply ported to this operator.

    This operator makes use of the App SDK MonaiSegInferenceOperator in a composition approach.
    It creates the pre-transforms as well as post-transforms with MONAI dictionary based transforms.
    Note that the App SDK InMemImageReader, derived from MONAI ImageReader, is passed to LoadImaged.
    This derived reader is needed to parse the in memory image object, and return the expected data structure.
    Loading of the model, and predicting using the in-proc PyTorch inference is done by MonaiSegInferenceOperator.

    Named Input:
        image: Image object.

    Named Outputs:
        seg_image: Image object of the segmentation object.
        saved_images_folder: Path to the folder with intermediate image output, not requiring a downstream receiver.
    """

    DEFAULT_OUTPUT_FOLDER = Path.cwd() / "static_root/cloud-server/out-dataset"

    def __init__(
        self,
        *args,
        app_context: AppContext,
        model_path: Path,
        output_folder: Path = DEFAULT_OUTPUT_FOLDER,
        **kwargs,
    ):
        self.logger = logging.getLogger("{}.{}".format(__name__, type(self).__name__))
        self._input_dataset_key = "image"
        self._pred_dataset_key = "pred"

        self.model_path = model_path
        self.output_folder = output_folder
        self.output_folder.mkdir(parents=True, exist_ok=True)
        self.app_context = app_context
        self.input_name_image = "image"
        self.output_name_seg = "seg_image"
        self.output_name_saved_images_folder = "saved_images_folder"

        # Call the base class __init__() last.
        # Also, the base class has an attribute called fragment for storing the fragment object
        super().__init__(*args, **kwargs)

    def setup(self):
        spec.input(self.input_name_image)
        spec.output(self.output_name_seg)
        spec.output(self.output_name_saved_images_folder).condition(
            ConditionType.NONE
        )  # Output not requiring a receiver

    def compute(self, op_input, op_output, context):
        input_image = op_input.receive(self.input_name_image)
        if not input_image:
            raise ValueError("Input image is not found.")

        # This operator gets an in-memory Image object, so a specialized ImageReader is needed.
        _reader = InMemImageReader(input_image)

        # In this example, the input image, once loaded at the beginning of the pre-transforms, can
        # be saved on disk, so can the segmentation prediction image at the end of the post-transform.
        # They are both saved in the same subfolder of the application output folder, with names
        # distinguished by the postfix. They can also be saved in different subfolder if need be.
        # These images files can then be packaged for rendering.
        # In the code below, saving of the image files are disabled to save 10 seconds if nii, and 20 if nii.gz
        pre_transforms = self.pre_process(_reader, str(self.output_folder))
        post_transforms = self.post_process(pre_transforms, str(self.output_folder))

        # Delegates inference and saving output to the built-in operator.
        infer_operator = MonaiSegInferenceOperator(
            #self.fragment,
            roi_size=(
                160,
                160,
                160,
            ),
            pre_transforms=pre_transforms,
            post_transforms=post_transforms,
            overlap=0.6,
            app_context=self.app_context,
            model_name="",
            inferer=InfererType.SLIDING_WINDOW,
            sw_batch_size=4,
            model_path=self.model_path,
            name="monai_seg_inference_op",
        )

        # Setting the keys used in the dictionary based transforms
        infer_operator.input_dataset_key = self._input_dataset_key
        infer_operator.pred_dataset_key = self._pred_dataset_key

        # Now emit data to the output ports of this operator
        op_output.emit(infer_operator.compute_impl(input_image, context), self.output_name_seg)
        op_output.emit(self.output_folder, self.output_name_saved_images_folder)

    def pre_process(self, img_reader, out_dir: str = "./input_images") -> Compose:
        """Composes transforms for preprocessing input before predicting on a model."""

        Path(out_dir).mkdir(parents=True, exist_ok=True)

        my_key = self._input_dataset_key
        return Compose(
            [
                LoadImaged(keys=my_key, reader=img_reader),
                EnsureChannelFirstd(keys=my_key),
                # The SaveImaged transform can be commented out to save 5 seconds.
                # Uncompress NIfTI file, nii, is used favoring speed over size, but can be changed to nii.gz
                # SaveImaged(
                #     keys=my_key,
                #     output_dir=out_dir,
                #     output_postfix="",
                #     resample=False,
                #     output_ext=".nii",
                # ),
                Spacingd(keys=my_key, pixdim=(1.0, 1.0, 1.0), mode=("bilinear"), align_corners=True),
                ScaleIntensityRanged(my_key, a_min=-21, a_max=189, b_min=0.0, b_max=1.0, clip=True),
                CropForegroundd(my_key, source_key=my_key),
            ]
        )

    def post_process(self, pre_transforms: Compose, out_dir: str = "./prediction_output") -> Compose:
        """Composes transforms for postprocessing the prediction results."""

        Path(out_dir).mkdir(parents=True, exist_ok=True)

        pred_key = self._pred_dataset_key
        return Compose(
            [
                Activationsd(keys=pred_key, softmax=True),
                AsDiscreted(keys=pred_key, argmax=True),
                Invertd(
                    keys=pred_key, transform=pre_transforms, orig_keys=self._input_dataset_key, nearest_interp=True
                ),
                # The SaveImaged transform can be commented out to save 5 seconds.
                # Uncompress NIfTI file, nii, is used favoring speed over size, but can be changed to nii.gz
                # SaveImaged(
                #     keys=pred_key,
                #     output_dir=out_dir,
                #     output_postfix="seg",
                #     output_dtype=uint8,
                #     resample=False,
                #     output_ext=".nii",
                # ),
            ]
        )



# Copyright 2021-2023 MONAI Consortium
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
from pathlib import Path

from livertumor_seg_operator import LiverTumorSegOperator
from pydicom.sr.codedi import codes  # ctRequired for setting SegmentDescription attributes.

# This sample example completes the processing of a DICOM series with around 600 instances within 45 seconds,
# and time reduces to about 23 seconds if the STL generation is disabled,
# on a desktop with Ubuntu 20.04, 32GB of RAM, and a Nvidia GPU GV100 with 32GB of memory.


# @resource(cpu=1, gpu=1, memory="7Gi")
class AILiverTumorApp(Application):
    def __init__(self, *args, **kwargs):
        """Creates an application instance."""

        self._logger = logging.getLogger("{}.{}".format(__name__, type(self).__name__))
        super().__init__(*args, **kwargs)

    def run(self, *args, **kwargs):
        # This method calls the base class to run. Can be omitted if simply calling through.
        self._logger.info(f"Begin {self.run.__name__}")
        super().run(*args, **kwargs)
        self._logger.info(f"End {self.run.__name__}")

    def compose(self):
        """Creates the app specific operators and chain them up in the processing DAG."""

        self._logger.info(f"Begin {self.compose.__name__}")


        self._logger.info(f"App input and output path: {app_input_path}, {app_output_path}")

        # Creates the custom operator(s) as well as SDK built-in operator(s).
        study_loader_op = DICOMDataLoaderOperator(
            self, CountCondition(self, 1), input_folder=app_input_path, name="dcm_loader_op"
        )
        series_selector_op = DICOMSeriesSelectorOperator(self, rules=Sample_Rules_Text, name="series_selector_op")
        series_to_vol_op = DICOMSeriesToVolumeOperator(self, name="series_to_vol_op")
        # Model specific inference operator, supporting MONAI transforms.
        liver_tumor_seg_op = LiverTumorSegOperator(self, app_context=app_context, model_path=model_path, name="seg_op")
        #     self, model_path=model_path, output_folder=app_output_path, name="seg_op"
        # )

        # Create the surface mesh STL conversion operator
        stl_op = STLConversionOperator(self, output_file=app_output_path.joinpath("stl/mesh.stl"), name="stl_op")

        # Create DICOM Seg writer providing the required segment description for each segment with
        # the actual algorithm and the pertinent organ/tissue.
        # The segment_label, algorithm_name, and algorithm_version are limited to 64 chars.
        # https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_6.2.html
        # User can Look up SNOMED CT codes at, e.g.
        # https://bioportal.bioontology.org/ontologies/SNOMEDCT

        _algorithm_family = codes.DCM.ArtificialIntelligence

        segment_descriptions = [
            SegmentDescription(
                segment_label="Liver",
                segmented_property_category=codes.SCT.Organ,
                segmented_property_type=codes.SCT.Liver,
                algorithm_name=_algorithm_name,
                algorithm_family=_algorithm_family,
                algorithm_version=_algorithm_version,
            ),
            SegmentDescription(
                segment_label="Tumor",
                segmented_property_category=codes.SCT.Tumor,
                segmented_property_type=codes.SCT.Tumor,
                algorithm_name=_algorithm_name,
                algorithm_family=_algorithm_family,
                algorithm_version=_algorithm_version,
            ),
        ]

        dicom_seg_writer = DICOMSegmentationWriterOperator(
            self, segment_descriptions=segment_descriptions, output_folder=app_output_path, name="dcm_seg_writer_op"
        )
        # Create the processing pipeline, by specifying the source and destination operators, and
        # ensuring the output from the former matches the input of the latter, in both name and type.
        self.add_flow(study_loader_op, series_selector_op, {("dicom_study_list", "dicom_study_list")})
        self.add_flow(
            series_selector_op, series_to_vol_op, {("study_selected_series_list", "study_selected_series_list")}
        )
        self.add_flow(series_to_vol_op, liver_tumor_seg_op, {("image", "image")})

        # Note below the dicom_seg_writer requires two inputs, each coming from a source operator.
        self.add_flow(
            series_selector_op, dicom_seg_writer, {("study_selected_series_list", "study_selected_series_list")}
        )
        self.add_flow(liver_tumor_seg_op, dicom_seg_writer, {("seg_image", "seg_image")})

        # Add the stl mesh operator to save the mesh in stl format.
        self.add_flow(liver_tumor_seg_op, stl_op, {("seg_image", "image")})

        self._logger.info(f"End {self.compose.__name__}")



# Mock function for processing (replace with your actual processing logic)
async def process_data(input):
    await asyncio.sleep(5)  # Simulate processing time
    # Model specific inference operator, supporting MONAI transforms.
    liver_tumor_seg_op = LiverTumorSegOperator(self, app_context=app_context, model_path=model_path, name="seg_op")
    #     self, model_path=model_path, output_folder=app_output_path, name="seg_op"
    # )
    # Create the surface mesh STL conversion operator
    stl_op = STLConversionOperator(self, output_file=app_output_path.joinpath("stl/mesh.stl"), name="stl_op")
    # Replace this with your actual processing logic
    result_data = {"output": stl_op}
    return result_data

# Functions to handle requests from clientside
async def async_func():
    print('Velotio ...')
    await asyncio.sleep(1)
    print('... Technologies!')


def handleAppEvent(request):
    if request.method == "POST":
        uploaded_pointcloud = request.FILES.get('uploaded_image')

        # Mock function to process the point cloud asynchronously
        async def process_and_respond():
            try:
                # Process point cloud
                processed_data = await process_data(uploaded_pointcloud)

                # Create a JSON response containing the processed data and status
                response_data = {
                    "status": "onLoaded",
                    "data": processed_data,
                }
            except Exception as e:
                # Handle error during processing
                response_data = {
                    "status": "onLoadError",
                    "error_message": str(e),
                }
            finally:
                # Return the JSON response
                return JsonResponse(response_data)

        # Start asynchronous processing
        asyncio.ensure_future(process_and_respond())

        # Return an initial response indicating that processing has started
        return JsonResponse({"status": "onLoad"})

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)

