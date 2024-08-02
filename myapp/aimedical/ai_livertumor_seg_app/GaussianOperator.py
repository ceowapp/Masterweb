from pathlib import Path
from saveFile import save_file_to_folder as saveFile

class GaussianOperator():

    DEFAULT_OUTPUT_FOLDER = Path.cwd() / "output"

    def __init__(self, *args, output_folder: Path, **kwargs):

        self.output_folder = output_folder if output_folder else GaussianOperator.DEFAULT_OUTPUT_FOLDER
        self.index = 0

        # If `self.sigma_default` is set here (e.g., `self.sigma_default = 0.2`), then
        # the default value by `param()` in `setup()` will be ignored.
        # (you can just call `spec.param("sigma_default")` in `setup()` to use the
        # default value)
        self.sigma_default = 0.2
        self.channel_axis = 2

        # Need to call the base class constructor last
        super().__init__(*args, **kwargs)

    def compute(self, op_input, op_output, context):
        from skimage.filters import gaussian
        from skimage.io import imsave
        import numpy as np

        self.index += 1
        print(f"Number of times operator {self.name} whose class is defined in {__name__} called: {self.index}")

        data_in = op_input("in1")
        data_out = gaussian(op_input, sigma=self.sigma_default, channel_axis=self.channel_axis)

        # Make sure the data type is what PIL Image can support, as the imsave function calls PIL Image fromarray()
        # Some details can be found at https://stackoverflow.com/questions/55319949/pil-typeerror-cannot-handle-this-data-type
        print(f"Data type of output: {type(data_out)!r}, max = {np.max(data_out)!r}")
        if np.max(data_out) <= 1:
            data_out = (data_out*255).astype(np.uint8)
        print(f"Data type of output post conversion: {type(data_out)!r}, max = {np.max(data_out)!r}")

        # For now, use attribute of self to find the output path.
        self.output_folder.mkdir(parents=True, exist_ok=True)
        output_path = self.output_folder / "final_output.png"
        saveFile(output_path, data_out)

        #op_output.emit(data_out, "out1")