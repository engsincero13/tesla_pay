#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: arquivo .env nao encontrado em $ENV_FILE"
    echo "Copie o .env.example e preencha os valores:"
    echo "  cp .env.example .env"
    exit 1
fi

# Carrega variaveis do .env (ignora comentarios e linhas vazias)
set -a
while IFS='=' read -r key value; do
    # Ignora linhas vazias e comentarios
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    # Remove espacos ao redor
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    export "$key=$value"
done < "$ENV_FILE"
set +a

echo "Variaveis carregadas do .env"
echo "Fazendo deploy do stack teslapay..."

docker stack deploy -c "$SCRIPT_DIR/docker-stack.yml" teslapay

echo "Deploy concluido!"
