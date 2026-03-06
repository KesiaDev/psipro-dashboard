# Backend: Implementar DELETE /patients/:id

O frontend chama `DELETE /patients/:id` para excluir pacientes. Os erros **404** indicam que esse endpoint não existe ou não está acessível no backend NestJS.

## O que implementar

O backend precisa expor:

```
DELETE /patients/:id
```

- **Parâmetro:** `id` (UUID do paciente) na URL
- **Headers:** `Authorization: Bearer <token>`, `X-Clinic-Id: <clinicId>`
- **Resposta:** 200 OK ou 204 No Content ao excluir com sucesso
- **Erros:** 404 se o paciente não existir, 403 se não tiver permissão

## Exemplo NestJS

```typescript
// patients.controller.ts
@Delete(':id')
async delete(@Param('id') id: string) {
  await this.patientsService.delete(id);
  // Retorna 200 ou 204
}
```

## Verificar prefixo da API

Se o backend usa `setGlobalPrefix('api')`, a rota completa será:

`DELETE https://psipro-backend-production.up.railway.app/api/patients/:id`

O frontend usa `VITE_API_URL` como base. Se a URL base **já inclui** `/api`, as chamadas ficam corretas. Caso contrário, pode ser necessário ajustar a URL base ou o prefixo no backend.
