FROM python:3.10
WORKDIR /code

# install python packages
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install --no-cache-dir --upgrade pip
COPY ./app/all_requirements.txt /code/app/all_requirements.txt
RUN pip install --no-cache-dir -r /code/app/all_requirements.txt

# get app code
COPY ./app /code/app
# get frontend code
COPY ./dist /code/frontend

EXPOSE 80
VOLUME /code/vol

# launch app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]

# # optionally, save requirements and environment configuration
# RUN pip freeze > /code/vol/all_requirements.txt
# RUN wget https://raw.githubusercontent.com/pytorch/pytorch/master/torch/utils/collect_env.py
# RUN python collect_env.py > /code/vol/env.txt
# RUN chmod +x /code/app/save_env_and_launch.sh
# CMD ["sh", "/code/app/save_env_and_launch.sh"]