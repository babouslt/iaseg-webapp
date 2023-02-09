FROM python:3.10
WORKDIR /code

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --upgrade fastapi
RUN pip install --no-cache-dir --upgrade websockets
RUN pip install --no-cache-dir --upgrade uvicorn
RUN pip install --no-cache-dir --upgrade numpy
RUN pip install --no-cache-dir --upgrade torch torchvision
#  --extra-index-url https://download.pytorch.org/whl/cpu
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install --no-cache-dir --upgrade opencv-python-headless
RUN pip install --no-cache-dir --upgrade scikit-image
RUN pip install --no-cache-dir --upgrade git+https://github.com/rwightman/pytorch-image-models.git
RUN pip install --no-cache-dir --upgrade mmcv
RUN pip install --no-cache-dir --upgrade albumentations
RUN pip install --no-cache-dir --upgrade tensorboard
RUN pip install --no-cache-dir --upgrade matplotlib
RUN pip install --no-cache-dir --upgrade PyYAML
RUN pip install --no-cache-dir --upgrade easydict
RUN pip install --no-cache-dir --upgrade Cython
COPY ./app /code/app
# RUN wget https://raw.githubusercontent.com/pytorch/pytorch/master/torch/utils/collect_env.py
# CMD python collect_env.py > /code/vol/env.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]