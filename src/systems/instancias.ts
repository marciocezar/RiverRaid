// Serviços compartilhados entre cenas. Um único contexto de áudio por página.
import { Som } from "./som.ts";

export const som = new Som();
