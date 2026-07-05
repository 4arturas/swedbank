declare module 'chart.js' {
  export class Chart {
    static register(...args: any[]): void;
    constructor(ctx?: any, config?: any);
    destroy(): void;
  }
  export const registerables: any[];
}
declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    text(text: string, x: number, y: number): void;
    save(filename: string): void;
  }
}
