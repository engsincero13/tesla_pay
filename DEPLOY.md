# Deploy no Docker Swarm

Este guia explica como fazer o deploy da aplicação CRM Tesla em um ambiente Docker Swarm.

## Pré-requisitos

1. Docker Swarm inicializado na VPS
2. Rede `network_swarm_public` criada
3. Traefik configurado e rodando no Swarm
4. Imagens Docker publicadas no Docker Hub
5. Arquivo `.env` configurado no backend

## Variáveis de Ambiente

As variáveis sensíveis são carregadas do arquivo `backend/.env`. 

### Configuração do .env

1. Copie o arquivo de exemplo:
```bash
cp backend/.env.example backend/.env
```

2. Edite o arquivo `backend/.env` e configure:
   - `DATABASE_URL`: String de conexão do PostgreSQL
   - `JWT_SECRET`: Chave secreta para JWT (use uma string aleatória forte)

**IMPORTANTE**: O arquivo `.env` está no `.gitignore` e não deve ser commitado no repositório.

### Variáveis no docker-compose.yml

O `docker-compose.yml` usa `env_file` para carregar automaticamente as variáveis do `backend/.env`:

```yaml
crm_backend:
  env_file:
    - ./backend/.env
```


## Comandos de Deploy

### 1. Build e Push das Imagens

```bash
# Build e push do frontend
cd frontend
docker build -t gibaajr/crm_frontend:latest .
docker push gibaajr/crm_frontend:latest

# Build e push do backend
cd ../backend
docker build -t gibaajr/crm_backend:latest .
docker push gibaajr/crm_backend:latest
```

### 2. Configurar .env na VPS

**IMPORTANTE**: O arquivo `.env` não é versionado no Git. Você precisa criá-lo manualmente na VPS.

```bash
# Na VPS, dentro do diretório do projeto
cd /caminho/do/projeto/backend
nano .env
```

Cole o conteúdo com suas credenciais:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=sua-chave-secreta-forte-aqui
PORT=3333
NODE_ENV=production
CORS_ORIGIN=https://crm.teslatreinamentos.com
```

Salve e feche (Ctrl+X, Y, Enter).

### 3. Deploy no Swarm

```bash
# Na raiz do projeto
docker stack deploy -c docker-compose.yml crm
```

### 4. Verificar Status


```bash
# Ver serviços
docker service ls

# Ver logs do frontend
docker service logs -f crm_crm_frontend

# Ver logs do backend
docker service logs -f crm_crm_backend
```

### 5. Atualizar Serviços

```bash
# Atualizar frontend
docker service update --image gibaajr/crm_frontend:latest crm_crm_frontend

# Atualizar backend
docker service update --image gibaajr/crm_backend:latest crm_crm_backend
```

### 6. Remover Stack

```bash
docker stack rm crm
```

## Configuração do Traefik

O `docker-compose.yml` já está configurado com as labels do Traefik:

- **Frontend**: `https://crm.teslatreinamentos.com`
- **Backend**: `https://crm.teslatreinamentos.com/api`

O middleware `stripprefix` remove o `/api` antes de enviar as requisições para o backend.

## Troubleshooting

### Serviço não inicia
```bash
# Ver detalhes do serviço
docker service ps crm_crm_backend --no-trunc

# Ver logs
docker service logs crm_crm_backend
```

### Atualizar configuração
```bash
# Edite o docker-compose.yml e execute
docker stack deploy -c docker-compose.yml crm
```

### Escalar serviços
```bash
# Aumentar réplicas do frontend
docker service scale crm_crm_frontend=3
```
