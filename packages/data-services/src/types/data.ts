// Tipo para datos genéricos
export type GenericData = {
    id: string;
    key: string;
    value: any;
    category: string;
    createdAt: Date;
    updatedAt: Date;
};

// Tipo para crear/actualizar datos
export type DataFormData = {
    key: string;
    value: any;
    category: string;
}; 