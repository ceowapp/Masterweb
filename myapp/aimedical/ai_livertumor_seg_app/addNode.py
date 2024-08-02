from pathlib import Path
from getFile import check_file_exists as checkFileExist

import numpy as np

TASK_LIST = []

BASE_DIR = Path(__file__).resolve().parent.parent

async def addNode(task, *args):
    """Performs computation with the provided context."""

    TASK_LIST.append(task

    for task in TASK_LIST:

        try:
        for params in args:
            # Access the elements of the tuple
            int, out = params
            getFile(out)
            processNode(task)


        except Exception:
            pass

        if not input_path or not Path(input_path).is_file:
            self._logger.info(f"No or invalid file path from the optional input port: {input_path}")
            # Try to fall back to use the object attribute if it is valid
            if self.input_path and self.input_path.is_file():
                input_path = self.input_path
            else:
                raise ValueError(f"No valid file path from input port or obj attribute: {self.input_path}")

        image_np = self.convert_and_save(input_path)
        op_output.emit(image_np, self.output_name_image)


async def processNode(func):
    try:
        # Process point cloud asynchronously
         func(**args)

    except Exception as e:
        # Handle error during processing
        response_data = {
            "status": f'This task{func} does not run sucessfully',
            "error_message": str(e),
        }
    finally:
        # Return the JSON response
        return response_data

    return response_data




async def getFile(filename, foldername):
    try:
        # Process point cloud asynchronously
        res = check_file_exists(filename)

        filePathString = f'foldername' 'filename'

        file = os.abspath(filePathString)

    if res is True:
        response= {
        "status": "Get File successfully",
        "data": file,
    }

    else:

        response = {
            "status": "Get File unsuccessfully",
            "data": res,
        }

    except Exception as e:
    # Handle error during processing
    response_data = {
        "status": f'This task{func} does not run sucessfully',
        "error_message": str(e),
    }

    finally:
    # Return the JSON response


