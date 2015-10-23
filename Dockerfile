FROM node:4-onbuild

RUN echo "deb http://ftp.debian.org/debian jessie-backports main contrib non-free" > /etc/apt/sources.list.d/jessie-backport.list \
  && apt-get update \
  && apt-get install ffmpeg -y

WORKDIR /download

VOLUME /download

ENTRYPOINT [ "node", "/usr/src/app/src/index.js" ]
