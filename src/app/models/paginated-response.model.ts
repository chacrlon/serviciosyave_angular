export interface PaginatedResponse<T> {
    content: T[];              // Lista de elementos en la página actual
    totalPages: number;        // Número total de páginas
    totalElements: number;     // Número total de elementos en todas las páginas
    size: number;              // Tamaño de la página (número de elementos por página)
    number: number;            // Número de la página actual (comienza en 0)
    first: boolean;            // Indica si es la primera página
    last: boolean;             // Indica si es la última página
    numberOfElements: number;  // Número de elementos en la página actual
    empty: boolean;            // Indica si la página está vacía
  }