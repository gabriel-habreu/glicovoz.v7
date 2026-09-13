export type GlicemiaStatus = 'normal' | 'alto' | 'baixo'

export interface GlicemiaDados {
    glicemia: number
    frase: string
    status: GlicemiaStatus
    horario: string
    timestamp: number
}