import torch
from pointe.point_e.diffusion.configs import DIFFUSION_CONFIGS, diffusion_from_config
from pointe.point_e.diffusion.sampler import PointCloudSampler
from pointe.point_e.models.download import load_checkpoint
from pointe.point_e.models.configs import MODEL_CONFIGS, model_from_config

def generate_pointcloud():
    # Check if models and data are already cached

    print('creating base model...')
    base_name = 'base40M'  # @param ["base40M", "base300M", "base1B"]
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    base_model = model_from_config(MODEL_CONFIGS[base_name], device)
    base_model.eval()
    base_diffusion = diffusion_from_config(DIFFUSION_CONFIGS[base_name])

    print('creating upsample model...')
    upsampler_model = model_from_config(MODEL_CONFIGS['upsample'], device)
    upsampler_model.eval()
    upsampler_diffusion = diffusion_from_config(DIFFUSION_CONFIGS['upsample'])

    print('downloading base checkpoint...')
    base_model.load_state_dict(load_checkpoint(base_name, device))

    print('downloading upsampler checkpoint...')
    upsampler_model.load_state_dict(load_checkpoint('upsample', device))

    # build point cloud sampler
    sampler = PointCloudSampler(
        device=device,
        models=[base_model, upsampler_model],
        diffusions=[base_diffusion, upsampler_diffusion],
        num_points=[1024, 4096 - 1024],
        aux_channels=['R', 'G', 'B'],
        guidance_scale=[3.0, 3.0],
    )

    return sampler




