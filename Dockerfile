# SPDX-License-Identifier: Apache-2.0
# Copyright Contributors to the Egeria project

# This Dockerfile should be run from the parent directory of the egeria-reac-ui directory
# ie
# docker -f ./Dockerfile 

# The npm build for the UI must have fully completed prior to this

FROM node:15-alpine

# Thes are optional tags used to add additional metadata into the docker image
# These may be supplied by the pipeline in future - until then they will default

ARG version=2.8-SNAPSHOT
ARG VCS_REF=unknown
ARG VCS_ORIGIN=unknown
ARG BUILD_TIME=unknown
ARG VCS_DATE=unknown

ENV version ${version}

# Labels from https://github.com/opencontainers/image-spec/blob/master/annotations.md#pre-defined-annotation-keys (with additions prefixed    ext)
LABEL org.opencontainers.image.vendor = "ODPi" \
      org.opencontainers.image.title = "Egeria" \
      org.opencontainers.image.description = "Egeria Presentation Server" \
      org.opencontainers.image.url = "https://egeria.odpi.org/" \
      org.opencontainers.image.source = "$VCS_ORIGIN" \
      org.opencontainers.image.authors = "ODPi Egeria" \
      org.opencontainers.image.revision = "$VCS_REF" \
      org.opencontainers.image.licenses = "Apache-2.0" \
      org.opencontainers.image.created = "$BUILD_TIME" \
      org.opencontainers.image.version = "$version" \
      org.opencontainers.image.documentation = "https://github.com/odpi/egeria-react-ui" \
      org.opencontainers.image.ext.vcs-date = "$VCS_DATE" \
      org.opencontainers.image.ext.docker.cmd = "docker run -d -p 8091:8091 odpi/egeria-presentation-server" \
      org.opencontainers.image.ext.docker.debug = "docker exec -it $CONTAINER /bin/sh" \


RUN mkdir -p /home/node/egeria-react-ui
WORKDIR /home/node/egeria-react-ui

# Note we copy the entire tree -- once the dev team have clarified what is needed, this can be optimized
# We also do not yet do a multi stage build, as this requires clarity over what needs to be present in the runtime
# vs the development environment. In addition we may wish to use nginx or similar for a production case.

COPY --chown=node:node .  .


USER 1000
EXPOSE 8091

WORKDIR cra-server

CMD [ "npm", "run", "prod" ]
