FROM quay.io/keycloak/keycloak:26.2

USER root

COPY start-keycloak.sh /start-keycloak.sh
RUN chmod +x /start-keycloak.sh

USER keycloak

RUN /opt/keycloak/bin/kc.sh build

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m"

HEALTHCHECK --interval=15s --timeout=2s --retries=15 \
    CMD curl -f http://localhost:${PORT:-8080}/health/ready || exit 1

ENTRYPOINT ["/bin/bash"]
CMD ["/start-keycloak.sh"]