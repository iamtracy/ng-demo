FROM quay.io/keycloak/keycloak:26.2

USER root

COPY start-keycloak.sh /start-keycloak.sh
RUN chmod +x /start-keycloak.sh

USER keycloak

RUN /opt/keycloak/bin/kc.sh build

ENV KC_JAVA_OPTS_MIN_MEMORY="256m" \
    KC_JAVA_OPTS_MAX_MEMORY="512m" \
    KC_JAVA_OPTS_METASPACE_SIZE="96M" \
    KC_JAVA_OPTS_MAX_METASPACE_SIZE="256m"

ENV JAVA_OPTS="-Xms${KC_JAVA_OPTS_MIN_MEMORY} -Xmx${KC_JAVA_OPTS_MAX_MEMORY} -XX:MetaspaceSize=${KC_JAVA_OPTS_METASPACE_SIZE} -XX:MaxMetaspaceSize=${KC_JAVA_OPTS_MAX_METASPACE_SIZE}"

HEALTHCHECK --interval=15s --timeout=2s --retries=15 \
    CMD curl -f http://localhost:${PORT:-8080}/health/ready || exit 1

ENTRYPOINT ["/bin/bash"]
CMD ["/start-keycloak.sh"]