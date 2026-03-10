# Backend: Implementar DELETE /sessions/:id

O frontend chama `DELETE /sessions/:id` para excluir sessões. O erro **404 - Cannot DELETE /api/sessions/:id** indica que esse endpoint não existe no backend NestJS.

## O que implementar

O backend precisa expor:

```
DELETE /sessions/:id
```

- **Parâmetro:** `id` (UUID da sessão) na URL
- **Headers:** `Authorization: Bearer <token>`, `X-Clinic-Id: <clinicId>`
- **Resposta:** 200 OK ou 204 No Content ao excluir com sucesso
- **Erros:** 404 se a sessão não existir, 403 se não tiver permissão

## Exemplo NestJS

```typescript
// sessions.controller.ts
@Delete(':id')
async delete(@Param('id') id: string) {
  await this.sessionsService.delete(id);
  // Retorna 200 ou 204
}
```

## Verificar

A rota completa será:

`DELETE https://<backend-url>/api/sessions/:id`

O frontend usa a base configurada em `VITE_API_URL` e chama `api.delete(\`/sessions/${id}\`)`.
