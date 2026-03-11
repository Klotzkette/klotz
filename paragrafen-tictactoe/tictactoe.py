# -*- coding: utf-8 -*-
"""
Paragrafen Tic-Tac-Toe
======================
Spieler 1: §   (einfach)
Spieler 2: §§  (doppelt)
Spielfeld: um 45 Grad gedreht (Rautenform)
"""

import sys
import math
import pygame

# ── Konstanten ────────────────────────────────────────────────────────────────
WIDTH, HEIGHT = 780, 820
FPS           = 60

# Farben
BG_MAIN      = (26,  26,  46)    # #1a1a2e – Haupthintergrund
BG_CELL      = (22,  33,  62)    # #16213e – Zelleninneres
BG_HOVER     = (42,  42,  74)    # Hover-Hervorhebung
BG_WIN       = (245, 166,  35)   # Gold – Gewinner-Zelle
COLOR_LINE   = (83,  52, 131)    # #533483 – Gitterlinien
COLOR_P1     = (233,  69,  96)   # Rot-Pink
COLOR_P2     = (168, 218, 220)   # Hellblau
COLOR_TXT    = (234, 234, 234)   # Text allgemein
COLOR_BUTTON = (83,  52, 131)
COLOR_BTN_HV = (120,  80, 180)

SYMBOL_P1  = "§"
SYMBOL_P2  = "§§"
GRID       = 3
CELL_SCALE = 155   # Pixel zwischen Rasterpunkten (Skalierung der Raute)


def rotate45(col: int, row: int, cx: float, cy: float, scale: float):
    """Gitterspalte/-zeile → Pixel-Koordinaten (45°-Drehung)."""
    rc = col - (GRID - 1) / 2
    rr = row - (GRID - 1) / 2
    px = (rc - rr) / math.sqrt(2) * scale
    py = (rc + rr) / math.sqrt(2) * scale
    return cx + px, cy + py


def draw_diamond(surf, pts, fill, outline, lw=3):
    """Zeichnet ein Rautenpolygon mit Füllung und Kontur."""
    pygame.draw.polygon(surf, fill, pts)
    pygame.draw.polygon(surf, outline, pts, lw)


def cell_polygon(cx, cy, half):
    return [
        (cx,        cy - half),   # oben
        (cx + half, cy),          # rechts
        (cx,        cy + half),   # unten
        (cx - half, cy),          # links
    ]


def point_in_diamond(px, py, cx, cy, half):
    """Manhattan-Abstand im rotierten 45°-System."""
    return abs(px - cx) + abs(py - cy) <= half * 1.05


# ── Hauptklasse ───────────────────────────────────────────────────────────────
class ParagrafenTTT:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("§  Paragrafen Tic-Tac-Toe  §§")

        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock  = pygame.time.Clock()

        # Schriften
        # Versuche eine systemweite Unicode-Schriftart zu laden
        sysfont = pygame.font.match_font(
            "dejavusans,freesans,arial,helvetica,segoeui,liberationsans"
        )
        self.font_title  = pygame.font.Font(sysfont, 26) if sysfont else pygame.font.SysFont("sans", 26)
        self.font_symbol1= pygame.font.Font(sysfont, 62) if sysfont else pygame.font.SysFont("sans", 62)
        self.font_symbol2= pygame.font.Font(sysfont, 42) if sysfont else pygame.font.SysFont("sans", 42)
        self.font_status = pygame.font.Font(sysfont, 22) if sysfont else pygame.font.SysFont("sans", 22)
        self.font_btn    = pygame.font.Font(sysfont, 20) if sysfont else pygame.font.SysFont("sans", 20)
        self.font_legend = pygame.font.Font(sysfont, 18) if sysfont else pygame.font.SysFont("sans", 18)

        self.cx = WIDTH  // 2
        self.cy = HEIGHT // 2 + 20
        self.half = CELL_SCALE * 0.46

        # Button-Rechteck (unten mittig)
        bw, bh = 200, 42
        self.btn_rect = pygame.Rect((WIDTH - bw) // 2, HEIGHT - 66, bw, bh)

        self.new_game()

    # ── Spiellogik ────────────────────────────────────────────────────────────
    def new_game(self):
        self.board      = [[""] * GRID for _ in range(GRID)]
        self.current    = 1
        self.game_over  = False
        self.winner_cells = []
        self.hover      = None

    WIN_LINES = [
        [(0,0),(1,0),(2,0)], [(0,1),(1,1),(2,1)], [(0,2),(1,2),(2,2)],  # Zeilen
        [(0,0),(0,1),(0,2)], [(1,0),(1,1),(1,2)], [(2,0),(2,1),(2,2)],  # Spalten
        [(0,0),(1,1),(2,2)], [(2,0),(1,1),(0,2)],                        # Diagonalen
    ]

    def check_winner(self):
        b = self.board
        for line in self.WIN_LINES:
            vals = [b[r][c] for (c, r) in line]
            if vals[0] and vals[0] == vals[1] == vals[2]:
                return [(c, r) for (c, r) in line]
        return None

    def is_draw(self):
        return all(self.board[r][c] for r in range(GRID) for c in range(GRID))

    # ── Geometrie ─────────────────────────────────────────────────────────────
    def cell_center(self, col, row):
        return rotate45(col, row, self.cx, self.cy, CELL_SCALE)

    def hit_cell(self, mx, my):
        best, best_d = None, float("inf")
        for r in range(GRID):
            for c in range(GRID):
                ccx, ccy = self.cell_center(c, r)
                # Manhattan-Abstand im gedrehten System
                d = abs(mx - ccx) + abs(my - ccy)
                if d < best_d:
                    best_d = d
                    best = (c, r)
        if best_d <= self.half * 1.05:
            return best
        return None

    # ── Zeichnen ──────────────────────────────────────────────────────────────
    def draw(self):
        screen = self.screen
        screen.fill(BG_MAIN)

        # ── Titel ──
        title_surf = self.font_title.render(
            "§   PARAGRAFEN  TIC-TAC-TOE   §§", True, COLOR_P2
        )
        screen.blit(title_surf, title_surf.get_rect(centerx=WIDTH // 2, top=14))

        # ── Status ──
        if self.game_over:
            if self.winner_cells:
                sym = SYMBOL_P1 if self.current == 1 else SYMBOL_P2
                col = COLOR_P1 if self.current == 1 else COLOR_P2
                msg = f"Spieler {self.current} ({sym}) gewinnt!"
            else:
                msg, col = "Unentschieden!", COLOR_TXT
        else:
            sym = SYMBOL_P1 if self.current == 1 else SYMBOL_P2
            col = COLOR_P1 if self.current == 1 else COLOR_P2
            msg = f"Spieler {self.current} ({sym}) ist dran"
        st_surf = self.font_status.render(msg, True, col)
        screen.blit(st_surf, st_surf.get_rect(centerx=WIDTH // 2, top=52))

        # ── Spielfeld ──
        for r in range(GRID):
            for c in range(GRID):
                ccx, ccy = self.cell_center(c, r)
                pts = cell_polygon(ccx, ccy, self.half)

                is_win   = (c, r) in self.winner_cells
                is_hover = (self.hover == (c, r)
                            and not self.board[r][c]
                            and not self.game_over)

                if is_win:
                    fill = BG_WIN
                elif is_hover:
                    fill = BG_HOVER
                else:
                    fill = BG_CELL

                draw_diamond(screen, pts, fill, COLOR_LINE, 3)

                val = self.board[r][c]
                if val:
                    fg   = (COLOR_P1 if val == "1" else COLOR_P2)
                    if is_win:
                        fg = BG_MAIN
                    sym_t = SYMBOL_P1 if val == "1" else SYMBOL_P2
                    sfont = self.font_symbol1 if val == "1" else self.font_symbol2
                    s = sfont.render(sym_t, True, fg)
                    screen.blit(s, s.get_rect(center=(int(ccx), int(ccy))))
                elif is_hover:
                    # Vorschau-Symbol (halbtransparent via heller Farbe)
                    sym_t = SYMBOL_P1 if self.current == 1 else SYMBOL_P2
                    sfont = self.font_symbol1 if self.current == 1 else self.font_symbol2
                    pc    = COLOR_P1 if self.current == 1 else COLOR_P2
                    # Abgedunkelte Vorschau
                    prev_c = tuple(max(0, x - 80) for x in pc)
                    s = sfont.render(sym_t, True, prev_c)
                    screen.blit(s, s.get_rect(center=(int(ccx), int(ccy))))

        # ── Legende ──
        leg_y = HEIGHT - 120
        l1 = self.font_legend.render("Spieler 1:  §", True, COLOR_P1)
        l2 = self.font_legend.render("Spieler 2:  §§", True, COLOR_P2)
        screen.blit(l1, (WIDTH // 2 - 180, leg_y))
        screen.blit(l2, (WIDTH // 2 + 40,  leg_y))

        # ── Button ──
        mx, my = pygame.mouse.get_pos()
        btn_col = COLOR_BTN_HV if self.btn_rect.collidepoint(mx, my) else COLOR_BUTTON
        pygame.draw.rect(screen, btn_col, self.btn_rect, border_radius=10)
        pygame.draw.rect(screen, COLOR_LINE, self.btn_rect, 2, border_radius=10)
        btn_t = self.font_btn.render("Neues Spiel", True, COLOR_TXT)
        screen.blit(btn_t, btn_t.get_rect(center=self.btn_rect.center))

        pygame.display.flip()

    # ── Event-Loop ────────────────────────────────────────────────────────────
    def run(self):
        while True:
            self.clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_F4 and (pygame.key.get_mods() & pygame.KMOD_ALT):
                        pygame.quit()
                        sys.exit()
                    if event.key == pygame.K_r:
                        self.new_game()

                if event.type == pygame.MOUSEMOTION:
                    self.hover = self.hit_cell(event.pos[0], event.pos[1])

                if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    if self.btn_rect.collidepoint(event.pos):
                        self.new_game()
                        continue
                    if not self.game_over:
                        cell = self.hit_cell(event.pos[0], event.pos[1])
                        if cell:
                            col, row = cell
                            if not self.board[row][col]:
                                self.board[row][col] = str(self.current)
                                wl = self.check_winner()
                                if wl:
                                    self.winner_cells = wl
                                    self.game_over    = True
                                elif self.is_draw():
                                    self.game_over = True
                                else:
                                    self.current = 2 if self.current == 1 else 1

            self.draw()


# ── Entry-Point ───────────────────────────────────────────────────────────────
def main():
    game = ParagrafenTTT()
    game.run()


if __name__ == "__main__":
    main()
