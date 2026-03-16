export interface Table {
    id: number;
    number: number;
    status: Status;
}

enum Status {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved'
}