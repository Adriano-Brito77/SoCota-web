#!/usr/bin/env python3
"""Gera PDFs com resolucoes detalhadas das listas de Geometria Analitica.

O script usa apenas a biblioteca padrao do Python. Ele escreve PDFs simples em
formato A4, com fontes padrao do proprio PDF, para funcionar em ambientes sem
LaTeX, Pandoc ou bibliotecas externas.
"""

from __future__ import annotations

import textwrap
from pathlib import Path


OUTPUT_DIR = Path(__file__).resolve().parent
STUDENT = "Emilly Thais da Costa"


def pdf_literal(text: str) -> bytes:
    """Retorna uma string literal PDF com escape seguro para WinAnsiEncoding."""
    replacements = {
        "≈": "~=",
        "→": "->",
        "←": "<-",
        "×": "x",
        "·": ".",
        "√": "raiz",
        "²": "^2",
        "³": "^3",
        "θ": "theta",
        "α": "alfa",
        "π": "pi",
        "∈": "pertence",
        "ℝ": "R",
        "≠": "!=",
        "°": " graus",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    raw = text.encode("cp1252", "replace")
    escaped = bytearray()
    for byte in raw:
        if byte in (40, 41, 92):  # (, ), \
            escaped.extend(b"\\")
            escaped.append(byte)
        elif byte < 32 or byte > 126:
            escaped.extend(f"\\{byte:03o}".encode("ascii"))
        else:
            escaped.append(byte)
    return b"(" + bytes(escaped) + b")"


class SimplePDF:
    width = 595.28
    height = 841.89
    margin_x = 48
    margin_top = 54
    margin_bottom = 48

    def __init__(self) -> None:
        self.pages: list[bytes] = []

    def add_page(self, commands: list[bytes]) -> None:
        self.pages.append(b"\n".join(commands))

    def save(self, path: Path) -> None:
        objects: dict[int, bytes] = {}
        objects[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
        objects[3] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
        objects[4] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
        objects[5] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>"

        page_ids: list[int] = []
        next_id = 6
        for stream in self.pages:
            content_id = next_id
            page_id = next_id + 1
            next_id += 2
            objects[content_id] = (
                b"<< /Length "
                + str(len(stream)).encode("ascii")
                + b" >>\nstream\n"
                + stream
                + b"\nendstream"
            )
            objects[page_id] = (
                b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] "
                b"/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> "
                + f"/Contents {content_id} 0 R >>".encode("ascii")
            )
            page_ids.append(page_id)

        kids = b" ".join(f"{page_id} 0 R".encode("ascii") for page_id in page_ids)
        objects[2] = b"<< /Type /Pages /Kids [" + kids + b"] /Count " + str(len(page_ids)).encode("ascii") + b" >>"

        data = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets: dict[int, int] = {}
        for obj_id in range(1, next_id):
            offsets[obj_id] = len(data)
            data.extend(f"{obj_id} 0 obj\n".encode("ascii"))
            data.extend(objects[obj_id])
            data.extend(b"\nendobj\n")

        xref_offset = len(data)
        data.extend(f"xref\n0 {next_id}\n".encode("ascii"))
        data.extend(b"0000000000 65535 f \n")
        for obj_id in range(1, next_id):
            data.extend(f"{offsets[obj_id]:010d} 00000 n \n".encode("ascii"))
        data.extend(
            b"trailer\n"
            + f"<< /Size {next_id} /Root 1 0 R >>\n".encode("ascii")
            + b"startxref\n"
            + str(xref_offset).encode("ascii")
            + b"\n%%EOF\n"
        )
        path.write_bytes(data)


class DocumentRenderer:
    def __init__(self) -> None:
        self.pdf = SimplePDF()
        self.commands: list[bytes] = []
        self.y = SimplePDF.height - SimplePDF.margin_top
        self.page_no = 1

    def _footer(self) -> None:
        text = f"{STUDENT} - pagina {self.page_no}"
        self._draw(SimplePDF.margin_x, 30, text, "/F1", 8)

    def _new_page(self) -> None:
        self._footer()
        self.pdf.add_page(self.commands)
        self.commands = []
        self.page_no += 1
        self.y = SimplePDF.height - SimplePDF.margin_top

    def _ensure(self, needed: float) -> None:
        if self.y - needed < SimplePDF.margin_bottom:
            self._new_page()

    def _draw(self, x: float, y: float, text: str, font: str, size: int) -> None:
        self.commands.append(
            b"BT "
            + font.encode("ascii")
            + b" "
            + str(size).encode("ascii")
            + b" Tf "
            + f"{x:.2f} {y:.2f}".encode("ascii")
            + b" Td "
            + pdf_literal(text)
            + b" Tj ET"
        )

    def _add_wrapped(self, text: str, font: str, size: int, leading: float, width: int, indent: int = 0) -> None:
        if not text:
            self._ensure(leading)
            self.y -= leading
            return

        subsequent = " " * indent
        lines = textwrap.wrap(
            text,
            width=width,
            initial_indent=" " * indent,
            subsequent_indent=subsequent,
            break_long_words=False,
            replace_whitespace=False,
        )
        for line in lines or [""]:
            self._ensure(leading)
            self._draw(SimplePDF.margin_x, self.y, line, font, size)
            self.y -= leading

    def render(self, markdown: str, path: Path) -> None:
        for raw_line in markdown.strip().splitlines():
            line = raw_line.rstrip()
            if line == "<PAGE_BREAK>":
                self._new_page()
                continue
            if not line:
                self._add_wrapped("", "/F1", 11, 8, 92)
                continue
            if line.startswith("# "):
                self._ensure(40)
                self._draw(SimplePDF.margin_x, self.y, line[2:], "/F2", 20)
                self.y -= 28
                continue
            if line.startswith("## "):
                self._ensure(28)
                self._draw(SimplePDF.margin_x, self.y, line[3:], "/F2", 15)
                self.y -= 21
                continue
            if line.startswith("### "):
                self._ensure(24)
                self._draw(SimplePDF.margin_x, self.y, line[4:], "/F2", 12)
                self.y -= 17
                continue
            if line.startswith("    "):
                self._add_wrapped(line.strip(), "/F3", 9, 12, 88)
                continue
            if line.startswith("- "):
                self._add_wrapped("- " + line[2:], "/F1", 10, 13, 92, indent=2)
                continue
            self._add_wrapped(line, "/F1", 10, 13, 92)

        self._footer()
        self.pdf.add_page(self.commands)
        self.pdf.save(path)


def lista_01() -> str:
    return f"""
# Apostila de Resolucao - Lista 01
## Algebra Linear e Geometria Analitica
Aluno(a): {STUDENT}

Tema: vetores, produto escalar, produto vetorial e produto misto.

Nesta apostila, cada exercicio e resolvido passo a passo. A ideia principal e sempre transformar os dados geometricos em calculos com coordenadas.

<PAGE_BREAK>

## Lembretes de formulas
- Vetor entre dois pontos: se A(xA, yA, zA) e B(xB, yB, zB), entao AB = B - A = (xB - xA, yB - yA, zB - zA).
- Modulo de um vetor u = (a, b, c): |u| = raiz(a^2 + b^2 + c^2).
- Produto escalar: u . v = u1 v1 + u2 v2 + u3 v3.
- Ortogonalidade: dois vetores sao ortogonais quando u . v = 0.
- Angulo entre vetores: cos(theta) = (u . v) / (|u| |v|).
- Produto vetorial: u x v gera um vetor perpendicular a u e a v.
- Area do paralelogramo: A = |u x v|. Area do triangulo: A = |u x v| / 2.
- Produto misto: [u, v, w] = (u x v) . w. O volume do paralelepipedo e |[u, v, w]|.

## Parte 1 - Vetores e diferencas entre pontos
### Exercicio 1
Dados A(1, 2, -1), B(3, -1, 4) e C(-2, 0, 2).

Item a) Componentes algebricas dos vetores.

Para encontrar AB, subtraimos as coordenadas de A das coordenadas de B:
    AB = B - A = (3 - 1, -1 - 2, 4 - (-1))
    AB = (2, -3, 5)

Para encontrar BC, subtraimos as coordenadas de B das coordenadas de C:
    BC = C - B = (-2 - 3, 0 - (-1), 2 - 4)
    BC = (-5, 1, -2)

Para encontrar CA, subtraimos as coordenadas de C das coordenadas de A:
    CA = A - C = (1 - (-2), 2 - 0, -1 - 2)
    CA = (3, 2, -3)

Resposta do item a:
    AB = (2, -3, 5), BC = (-5, 1, -2), CA = (3, 2, -3)

Item b) Demonstracao de que AB + BC + CA = 0.

Somamos componente por componente:
    AB + BC + CA = (2, -3, 5) + (-5, 1, -2) + (3, 2, -3)
    AB + BC + CA = (2 - 5 + 3, -3 + 1 + 2, 5 - 2 - 3)
    AB + BC + CA = (0, 0, 0)

Logo:
    AB + BC + CA = vetor nulo

Item c) Interpretacao geometrica.

Os vetores AB, BC e CA representam um percurso fechado: saimos de A, vamos ate B, depois ate C e finalmente voltamos a A. Como o ponto final coincide com o ponto inicial, o deslocamento resultante e nulo. Geometricamente, esses vetores formam os lados orientados de um triangulo fechado.

### Exercicio 2
Dados P(2, -1, 3) e v = (-1, 3, 2).

Item a) Coordenadas de Q.

O vetor PQ deve ser paralelo a v, ter o dobro do modulo e manter o mesmo sentido. Isso significa que:
    PQ = 2v

Calculando:
    2v = 2(-1, 3, 2) = (-2, 6, 4)

Como PQ = Q - P, temos Q = P + PQ:
    Q = (2, -1, 3) + (-2, 6, 4)
    Q = (0, 5, 7)

Resposta:
    Q = (0, 5, 7)

Item b) Vetor QP e seu modulo.

O vetor QP e dado por P - Q:
    QP = P - Q = (2 - 0, -1 - 5, 3 - 7)
    QP = (2, -6, -4)

Modulo:
    |QP| = raiz(2^2 + (-6)^2 + (-4)^2)
    |QP| = raiz(4 + 36 + 16)
    |QP| = raiz(56) = 2 raiz(14)

Resposta:
    QP = (2, -6, -4) e |QP| = 2 raiz(14)

## Parte 2 - Produto escalar e angulo entre vetores
### Exercicio 3
Dados u = (2, m, -3) e v = (1, 4, 2).

Item a) Produto escalar em funcao de m.

Aplicando a definicao do produto escalar:
    u . v = 2 . 1 + m . 4 + (-3) . 2
    u . v = 2 + 4m - 6
    u . v = 4m - 4

Resposta:
    u . v = 4m - 4

Item b) Valor de m para que os vetores sejam ortogonais.

Para vetores ortogonais, o produto escalar deve ser zero:
    4m - 4 = 0
    4m = 4
    m = 1

Resposta:
    m = 1

### Exercicio 4
Dados a = (2, -6, 8) e b = (7, 1, 4).

Item a) Modulos.

Modulo de a:
    |a| = raiz(2^2 + (-6)^2 + 8^2)
    |a| = raiz(4 + 36 + 64)
    |a| = raiz(104) = 2 raiz(26)

Modulo de b:
    |b| = raiz(7^2 + 1^2 + 4^2)
    |b| = raiz(49 + 1 + 16)
    |b| = raiz(66)

Resposta:
    |a| = 2 raiz(26) e |b| = raiz(66)

Item b) Produto escalar.
    a . b = 2 . 7 + (-6) . 1 + 8 . 4
    a . b = 14 - 6 + 32
    a . b = 40

Resposta:
    a . b = 40

Item c) Angulo interno entre os vetores.

Usamos a formula:
    cos(theta) = (a . b) / (|a| |b|)

Substituindo:
    cos(theta) = 40 / (raiz(104) . raiz(66))
    cos(theta) = 40 / raiz(6864)
    cos(theta) = 40 / (4 raiz(429))
    cos(theta) = 10 / raiz(429)

Valor aproximado:
    cos(theta) ~= 0,4828
    theta = arccos(0,4828) ~= 61,13 graus

Em radianos:
    theta ~= 1,067 rad

Resposta:
    theta ~= 61,13 graus ou theta ~= 1,067 rad

## Parte 3 - Produto vetorial, area e interpretacao geometrica
### Exercicio 5
Dados u = (1, 2, 0) e v = (2, 0, 1).

Item a) Produto vetorial w = u x v.

Pela expansao do determinante:
    u x v = | i  j  k |
            | 1  2  0 |
            | 2  0  1 |

Calculando as componentes:
    componente i: 2 . 1 - 0 . 0 = 2
    componente j: -(1 . 1 - 0 . 2) = -1
    componente k: 1 . 0 - 2 . 2 = -4

Assim:
    w = u x v = (2, -1, -4)

Item b) Area do paralelogramo.

A area do paralelogramo gerado por u e v e o modulo do produto vetorial:
    A = |u x v|
    A = raiz(2^2 + (-1)^2 + (-4)^2)
    A = raiz(4 + 1 + 16)
    A = raiz(21)

Resposta:
    Area do paralelogramo = raiz(21)

Item c) Area do triangulo.

O triangulo formado pelos mesmos vetores corresponde a metade do paralelogramo:
    A_triangulo = raiz(21) / 2

Resposta:
    Area do triangulo = raiz(21) / 2

### Exercicio 6
Dados a = (1, 1, 0) e b = (0, 1, 1).

Item a) Produto vetorial a x b e seu modulo.

Calculando:
    a x b = (1 . 1 - 0 . 1, 0 . 0 - 1 . 1, 1 . 1 - 1 . 0)
    a x b = (1, -1, 1)

Modulo:
    |a x b| = raiz(1^2 + (-1)^2 + 1^2)
    |a x b| = raiz(3)

Resposta:
    a x b = (1, -1, 1) e |a x b| = raiz(3)

Item b) Valor de sen(theta).

Pela relacao:
    |a x b| = |a| |b| sen(theta)

Calculando os modulos:
    |a| = raiz(1^2 + 1^2 + 0^2) = raiz(2)
    |b| = raiz(0^2 + 1^2 + 1^2) = raiz(2)

Substituindo:
    raiz(3) = raiz(2) . raiz(2) . sen(theta)
    raiz(3) = 2 sen(theta)
    sen(theta) = raiz(3) / 2

Resposta:
    sen(theta) = raiz(3) / 2

Item c) Altura do paralelogramo.

A area do paralelogramo e |a x b| = raiz(3). A altura em relacao a uma base e:
    altura = area / base

Como |a| = |b| = raiz(2), a altura e a mesma tomando qualquer um dos dois vetores como base:
    h = raiz(3) / raiz(2)
    h = raiz(6) / 2

Resposta:
    h = raiz(6) / 2

## Parte 4 - Produto misto, volumes e vetor normal
### Exercicio 7
Dados u = (1, 1, 0), v = (0, 2, 1) e w = (1, 0, 3).

Item a) Produto misto [u, v, w].

Primeiro calculamos u x v:
    u x v = (1 . 1 - 0 . 2, 0 . 0 - 1 . 1, 1 . 2 - 1 . 0)
    u x v = (1, -1, 2)

Agora fazemos o produto escalar com w:
    [u, v, w] = (u x v) . w
    [u, v, w] = (1, -1, 2) . (1, 0, 3)
    [u, v, w] = 1 . 1 + (-1) . 0 + 2 . 3
    [u, v, w] = 7

Resposta:
    [u, v, w] = 7

Item b) Volume do paralelepipedo.

O volume e o valor absoluto do produto misto:
    V = |[u, v, w]| = |7| = 7

Resposta:
    V_paralelepipedo = 7

Item c) Volumes do prisma triangular e do tetraedro.

O prisma triangular tem como base metade da base do paralelepipedo. Portanto:
    V_prisma_triangular = 7 / 2

O tetraedro formado pelos tres vetores a partir de uma mesma origem possui volume igual a um sexto do paralelepipedo:
    V_tetraedro = 7 / 6

Resposta:
    V_prisma_triangular = 7/2 e V_tetraedro = 7/6

Item d) Altura do paralelepipedo projetada pelo vetor u.

Tomando como base o paralelogramo gerado por v e w, a altura associada ao vetor u e:
    h = volume / area_da_base

Calculamos v x w:
    v x w = (2 . 3 - 1 . 0, 1 . 1 - 0 . 3, 0 . 0 - 2 . 1)
    v x w = (6, 1, -2)

Area da base:
    |v x w| = raiz(6^2 + 1^2 + (-2)^2)
    |v x w| = raiz(41)

Logo:
    h = 7 / raiz(41)

Resposta:
    h = 7 / raiz(41)

### Exercicio 8
O plano pi e gerado por u = (1, 0, 1) e v = (1, 1, 0).

Item a) Vetor normal n = u x v.
    n = u x v
    n = (0 . 0 - 1 . 1, 1 . 1 - 1 . 0, 1 . 1 - 0 . 1)
    n = (-1, 1, 1)

Resposta:
    n = (-1, 1, 1)

Item b) Angulo entre d = (1, 2, 1) e n.

Produto escalar:
    d . n = 1(-1) + 2(1) + 1(1)
    d . n = 2

Modulos:
    |d| = raiz(1^2 + 2^2 + 1^2) = raiz(6)
    |n| = raiz((-1)^2 + 1^2 + 1^2) = raiz(3)

Assim:
    cos(alfa) = 2 / (raiz(6) . raiz(3))
    cos(alfa) = 2 / raiz(18)
    cos(alfa) = raiz(2) / 3

Valor aproximado:
    alfa ~= 61,87 graus

Resposta:
    alfa ~= 61,87 graus

Item c) Angulo entre e = (2, 1, 1) e n.

Produto escalar:
    e . n = 2(-1) + 1(1) + 1(1)
    e . n = -2 + 1 + 1 = 0

Como o produto escalar e zero, os vetores sao ortogonais.

Resposta:
    alfa = 90 graus
"""


def lista_02() -> str:
    return f"""
# Apostila de Resolucao - Lista 02
## Algebra Linear e Geometria Analitica
Aluno(a): {STUDENT}

Tema: retas no espaco - equacao vetorial, equacoes parametricas, forma simetrica, forma reduzida, angulo e ortogonalidade.

Nesta lista, alem do calculo, foi indicada a alternativa correspondente. Quando uma alternativa descreve a mesma reta com vetor diretor oposto, isso aparece como observacao.

<PAGE_BREAK>

## Lembretes de formulas
- Equacao vetorial da reta: P = A + t v, com t real.
- Se A(x0, y0, z0) e v = (a, b, c), entao as parametricas sao x = x0 + at, y = y0 + bt, z = z0 + ct.
- Forma simetrica: (x - x0)/a = (y - y0)/b = (z - z0)/c, quando a, b e c sao nao nulos.
- Angulo entre retas: e o angulo entre seus vetores diretores.
- Ortogonalidade entre retas: v1 . v2 = 0.

## Questao 1
Enunciado: reta que passa por A(5, 0, -3) e possui vetor diretor v = (-2, 4, 1).

A equacao vetorial de uma reta e:
    (x, y, z) = A + t v

Substituindo o ponto e o vetor:
    (x, y, z) = (5, 0, -3) + t(-2, 4, 1)

Resposta:
    Alternativa d)

Observacao: a alternativa c usa o vetor oposto (2, -4, -1), que descreve a mesma reta geometrica, mas a alternativa d e a que usa exatamente o vetor diretor informado no enunciado.

## Questao 2
Equacoes parametricas:
    x = -1 + 5t
    y = 2 - 3t
    z = 4t

O ponto da reta aparece quando t = 0:
    x = -1, y = 2, z = 0

Logo, um ponto e:
    P = (-1, 2, 0)

O vetor diretor e formado pelos coeficientes de t:
    v = (5, -3, 4)

Resposta:
    Alternativa b) Ponto (-1, 2, 0) e vetor v = (5, -3, 4)

## Questao 3
Reta definida pelos pontos A(2, -1, 3) e B(0, 4, 5).

Primeiro encontramos um vetor diretor:
    AB = B - A
    AB = (0 - 2, 4 - (-1), 5 - 3)
    AB = (-2, 5, 2)

Usando A como ponto inicial:
    (x, y, z) = (2, -1, 3) + t(-2, 5, 2)

Equacoes parametricas:
    x = 2 - 2t
    y = -1 + 5t
    z = 3 + 2t

Resposta:
    Alternativa a)

Observacao: a alternativa d tambem descreve a mesma reta, usando B como ponto inicial e o vetor oposto (2, -5, -2). Para a resolucao direta a partir de A e AB, marca-se a alternativa a.

## Questao 4
Ponto P(-3, 1, 6) e vetor diretor v = (4, 2, -5).

Forma simetrica:
    (x - x0)/a = (y - y0)/b = (z - z0)/c

Substituindo:
    (x - (-3))/4 = (y - 1)/2 = (z - 6)/(-5)

Portanto:
    (x + 3)/4 = (y - 1)/2 = (z - 6)/(-5)

Resposta:
    Alternativa b)

## Questao 5
Forma simetrica:
    (x - 1)/2 = (y + 3)/4 = (z - 2)/(-2)

Chamando a igualdade comum de t:
    (x - 1)/2 = t
    (y + 3)/4 = t
    (z - 2)/(-2) = t

Da primeira equacao:
    t = (x - 1)/2

Para y:
    y + 3 = 4t
    y + 3 = 4((x - 1)/2)
    y + 3 = 2x - 2
    y = 2x - 5

Para z:
    z - 2 = -2t
    z - 2 = -2((x - 1)/2)
    z - 2 = -x + 1
    z = -x + 3

Resposta:
    Alternativa a) y = 2x - 5 e z = -x + 3

## Questao 6
Vetores diretores:
    v1 = (1, 1, 0)
    v2 = (1, 0, 0)

Produto escalar:
    v1 . v2 = 1 . 1 + 1 . 0 + 0 . 0 = 1

Modulos:
    |v1| = raiz(1^2 + 1^2 + 0^2) = raiz(2)
    |v2| = raiz(1^2 + 0^2 + 0^2) = 1

Logo:
    cos(theta) = 1 / (raiz(2) . 1)
    cos(theta) = 1 / raiz(2)

O angulo cujo cosseno e 1/raiz(2) e:
    theta = 45 graus = pi/4 rad

Resposta:
    Alternativa c)

## Questao 7
Vetores diretores:
    v1 = (-3, m, 4)
    v2 = (2, 1, 1)

Para que as retas sejam ortogonais:
    v1 . v2 = 0

Calculando:
    (-3)(2) + m(1) + 4(1) = 0
    -6 + m + 4 = 0
    m - 2 = 0
    m = 2

Resposta:
    Alternativa b)

## Questao 8
Na equacao vetorial:
    P = A + t v

O parametro t e um numero real. Ao variar t, o vetor diretor v e multiplicado por diferentes escalares, produzindo todos os pontos da reta.

Resposta:
    Alternativa b) Um numero real que escala o vetor diretor, permitindo obter qualquer ponto da reta.

## Questao 9
Equacoes reduzidas:
    y = -2x + 5
    z = 4x - 1

Tomamos x como parametro:
    x = t
    y = -2t + 5
    z = 4t - 1

O ponto inicial, para t = 0, e:
    P = (0, 5, -1)

O vetor diretor vem dos coeficientes de t:
    v = (1, -2, 4)

Resposta:
    Alternativa c)

## Questao 10
Forma simetrica:
    (x - 5)/(-4) = y/2 = z + 3

Na forma simetrica, os denominadores indicam as componentes do vetor diretor. O termo z + 3 pode ser escrito como:
    (z + 3)/1

Assim, o vetor diretor e:
    v = (-4, 2, 1)

Resposta:
    Alternativa c)
"""


def lista_03() -> str:
    return f"""
# Apostila de Resolucao - Lista 03
## Algebra Linear e Geometria Analitica
Aluno(a): {STUDENT}

Tema: planos - equacao vetorial, equacoes parametricas, equacao geral e angulo entre planos.

O objetivo desta apostila e mostrar como transformar pontos, vetores diretores e vetores normais nas diferentes formas de equacao do plano.

<PAGE_BREAK>

## Lembretes de formulas
- Equacao vetorial do plano: P = A + h u + t v, com h e t reais.
- Equacoes parametricas: x, y e z sao escritos separadamente em funcao de h e t.
- Equacao geral do plano: ax + by + cz + d = 0, em que n = (a, b, c) e um vetor normal.
- Se o plano e gerado por dois vetores u e v, um vetor normal e n = u x v.
- Angulo entre planos: e o angulo entre seus vetores normais. Para o angulo agudo, usamos valor absoluto no produto escalar.

## Questao 1 - Equacao vetorial e parametrica do plano
Dados:
    A = (2, -1, 3)
    u = (1, 2, -1)
    v = (-2, 1, 3)

Como u e v sao vetores nao paralelos, eles geram o plano. A equacao vetorial e:
    P = A + h u + t v

Substituindo:
    P = (2, -1, 3) + h(1, 2, -1) + t(-2, 1, 3)

Portanto:
    (x, y, z) = (2, -1, 3) + h(1, 2, -1) + t(-2, 1, 3)

Agora separamos as coordenadas para obter as equacoes parametricas:
    x = 2 + h - 2t
    y = -1 + 2h + t
    z = 3 - h + 3t

Resposta:
    Equacao vetorial: (x, y, z) = (2, -1, 3) + h(1, 2, -1) + t(-2, 1, 3)
    Equacoes parametricas: x = 2 + h - 2t, y = -1 + 2h + t, z = 3 - h + 3t

## Questao 2 - Equacao geral do plano
Dados:
    P = (-1, 4, 2)
    n = (3, 2, -1)

Se n = (a, b, c) e normal ao plano, usamos:
    a(x - x0) + b(y - y0) + c(z - z0) = 0

Substituindo o ponto P e o vetor normal:
    3(x - (-1)) + 2(y - 4) + (-1)(z - 2) = 0

Simplificando:
    3(x + 1) + 2(y - 4) - (z - 2) = 0
    3x + 3 + 2y - 8 - z + 2 = 0
    3x + 2y - z - 3 = 0

Resposta:
    3x + 2y - z - 3 = 0

## Questao 3 - Equacao vetorial do plano
Plano:
    P = (2, -1, 1) + h(1, 2, 0) + t(-1, 1, 3)

Item 1) Equacoes parametricas.

Separamos cada coordenada:
    x = 2 + h - t
    y = -1 + 2h + t
    z = 1 + 3t

Resposta do item 1:
    x = 2 + h - t, y = -1 + 2h + t, z = 1 + 3t

Item 2) Equacao geral do plano.

Os vetores geradores sao:
    u = (1, 2, 0)
    v = (-1, 1, 3)

Um vetor normal e:
    n = u x v

Calculando:
    u x v = (2 . 3 - 0 . 1, 0 . (-1) - 1 . 3, 1 . 1 - 2 . (-1))
    u x v = (6, -3, 3)

Podemos simplificar dividindo por 3:
    n = (2, -1, 1)

Usando o ponto A = (2, -1, 1):
    2(x - 2) - 1(y - (-1)) + 1(z - 1) = 0

Simplificando:
    2(x - 2) - (y + 1) + (z - 1) = 0
    2x - 4 - y - 1 + z - 1 = 0
    2x - y + z - 6 = 0

Resposta do item 2:
    2x - y + z - 6 = 0

## Questao 4 - Plano determinado por tres pontos
Dados:
    A = (2, 1, 0)
    B = (0, 3, 1)
    C = (1, -1, 4)

Primeiro construimos dois vetores pertencentes ao plano:
    AB = B - A = (0 - 2, 3 - 1, 1 - 0)
    AB = (-2, 2, 1)

    AC = C - A = (1 - 2, -1 - 1, 4 - 0)
    AC = (-1, -2, 4)

Um vetor normal ao plano e:
    n = AB x AC

Calculando:
    AB x AC = (2 . 4 - 1 . (-2), 1 . (-1) - (-2) . 4, (-2) . (-2) - 2 . (-1))
    AB x AC = (10, 7, 6)

Logo, n = (10, 7, 6). Usando o ponto A:
    10(x - 2) + 7(y - 1) + 6(z - 0) = 0

Simplificando:
    10x - 20 + 7y - 7 + 6z = 0
    10x + 7y + 6z - 27 = 0

Resposta - equacao geral:
    10x + 7y + 6z - 27 = 0

Para a equacao vetorial, usamos o ponto A e os vetores AB e AC:
    (x, y, z) = (2, 1, 0) + h(-2, 2, 1) + t(-1, -2, 4)

Resposta - equacao vetorial:
    (x, y, z) = (2, 1, 0) + h(-2, 2, 1) + t(-1, -2, 4)

## Questao 5 - Angulo entre planos
Planos:
    pi1: 2x - y + z + 3 = 0
    pi2: x + 2y - 2z - 1 = 0

Os vetores normais sao formados pelos coeficientes de x, y e z:
    n1 = (2, -1, 1)
    n2 = (1, 2, -2)

O angulo entre planos e o angulo entre seus vetores normais. Para o angulo agudo:
    cos(theta) = |n1 . n2| / (|n1| |n2|)

Produto escalar:
    n1 . n2 = 2 . 1 + (-1) . 2 + 1 . (-2)
    n1 . n2 = 2 - 2 - 2
    n1 . n2 = -2

Usamos o valor absoluto:
    |n1 . n2| = 2

Modulos:
    |n1| = raiz(2^2 + (-1)^2 + 1^2) = raiz(6)
    |n2| = raiz(1^2 + 2^2 + (-2)^2) = raiz(9) = 3

Substituindo:
    cos(theta) = 2 / (3 raiz(6))
    cos(theta) ~= 0,2722

Logo:
    theta = arccos(0,2722)
    theta ~= 74,21 graus

Resposta:
    O angulo agudo entre os planos e aproximadamente 74,21 graus.
"""

# Versoes enxutas solicitadas: sem capa, apenas nome da aluna, calculos e respostas.
def lista_01() -> str:
    return f"""
# Lista 01 - Resolucao
Aluna: {STUDENT}

## Exercicio 1
a)
    AB = B - A = (3 - 1, -1 - 2, 4 - (-1)) = (2, -3, 5)
    BC = C - B = (-2 - 3, 0 - (-1), 2 - 4) = (-5, 1, -2)
    CA = A - C = (1 - (-2), 2 - 0, -1 - 2) = (3, 2, -3)

b)
    AB + BC + CA = (2, -3, 5) + (-5, 1, -2) + (3, 2, -3)
    AB + BC + CA = (0, 0, 0)

c)
    Resposta: percurso fechado A -> B -> C -> A; deslocamento resultante nulo.

## Exercicio 2
a)
    PQ = 2v = 2(-1, 3, 2) = (-2, 6, 4)
    Q = P + PQ = (2, -1, 3) + (-2, 6, 4) = (0, 5, 7)

b)
    QP = P - Q = (2 - 0, -1 - 5, 3 - 7) = (2, -6, -4)
    |QP| = raiz(2^2 + (-6)^2 + (-4)^2) = raiz(56) = 2 raiz(14)

## Exercicio 3
a)
    u . v = (2, m, -3) . (1, 4, 2)
    u . v = 2 . 1 + m . 4 + (-3) . 2 = 4m - 4

b)
    4m - 4 = 0
    4m = 4
    m = 1

## Exercicio 4
a)
    |a| = raiz(2^2 + (-6)^2 + 8^2) = raiz(104) = 2 raiz(26)
    |b| = raiz(7^2 + 1^2 + 4^2) = raiz(66)

b)
    a . b = 2 . 7 + (-6) . 1 + 8 . 4 = 14 - 6 + 32 = 40

c)
    cos(theta) = (a . b) / (|a| |b|)
    cos(theta) = 40 / (raiz(104) raiz(66)) = 10 / raiz(429)
    theta = arccos(10 / raiz(429)) ~= 61,13 graus
    theta ~= 1,067 rad

## Exercicio 5
a)
    u x v = | i  j  k |
            | 1  2  0 |
            | 2  0  1 |
    u x v = (2 . 1 - 0 . 0, -(1 . 1 - 0 . 2), 1 . 0 - 2 . 2)
    u x v = (2, -1, -4)

b)
    A_paralelogramo = |u x v| = raiz(2^2 + (-1)^2 + (-4)^2) = raiz(21)

c)
    A_triangulo = raiz(21) / 2

## Exercicio 6
a)
    a x b = (1 . 1 - 0 . 1, 0 . 0 - 1 . 1, 1 . 1 - 1 . 0)
    a x b = (1, -1, 1)
    |a x b| = raiz(1^2 + (-1)^2 + 1^2) = raiz(3)

b)
    |a| = raiz(2), |b| = raiz(2)
    sen(theta) = |a x b| / (|a| |b|)
    sen(theta) = raiz(3) / (raiz(2) raiz(2)) = raiz(3) / 2

c)
    h = area / base = raiz(3) / raiz(2) = raiz(6) / 2

## Exercicio 7
a)
    u x v = (1 . 1 - 0 . 2, 0 . 0 - 1 . 1, 1 . 2 - 1 . 0)
    u x v = (1, -1, 2)
    [u, v, w] = (u x v) . w = (1, -1, 2) . (1, 0, 3)
    [u, v, w] = 1 + 0 + 6 = 7

b)
    V_paralelepipedo = |7| = 7

c)
    V_prisma_triangular = 7 / 2
    V_tetraedro = 7 / 6

d)
    v x w = (2 . 3 - 1 . 0, 1 . 1 - 0 . 3, 0 . 0 - 2 . 1)
    v x w = (6, 1, -2)
    |v x w| = raiz(6^2 + 1^2 + (-2)^2) = raiz(41)
    h = V / |v x w| = 7 / raiz(41)

## Exercicio 8
a)
    n = u x v = (0 . 0 - 1 . 1, 1 . 1 - 1 . 0, 1 . 1 - 0 . 1)
    n = (-1, 1, 1)

b)
    d . n = 1(-1) + 2(1) + 1(1) = 2
    |d| = raiz(6), |n| = raiz(3)
    cos(alfa) = 2 / (raiz(6) raiz(3)) = raiz(2) / 3
    alfa ~= 61,87 graus

c)
    e . n = 2(-1) + 1(1) + 1(1) = 0
    alfa = 90 graus
"""


def lista_02() -> str:
    return f"""
# Lista 02 - Resolucao
Aluna: {STUDENT}

## Questao 1
    (x, y, z) = A + t v
    (x, y, z) = (5, 0, -3) + t(-2, 4, 1)
    Resposta: alternativa d)

## Questao 2
    x = -1 + 5t, y = 2 - 3t, z = 4t
    t = 0 -> P = (-1, 2, 0)
    v = (5, -3, 4)
    Resposta: alternativa b)

## Questao 3
    AB = B - A = (0 - 2, 4 - (-1), 5 - 3) = (-2, 5, 2)
    (x, y, z) = (2, -1, 3) + t(-2, 5, 2)
    x = 2 - 2t, y = -1 + 5t, z = 3 + 2t
    Resposta: alternativa a)

## Questao 4
    P = (-3, 1, 6), v = (4, 2, -5)
    (x - (-3))/4 = (y - 1)/2 = (z - 6)/(-5)
    (x + 3)/4 = (y - 1)/2 = (z - 6)/(-5)
    Resposta: alternativa b)

## Questao 5
    (x - 1)/2 = (y + 3)/4 = (z - 2)/(-2) = t
    t = (x - 1)/2
    y + 3 = 4t = 4((x - 1)/2) = 2x - 2
    y = 2x - 5
    z - 2 = -2t = -2((x - 1)/2) = -x + 1
    z = -x + 3
    Resposta: alternativa a)

## Questao 6
    v1 . v2 = (1, 1, 0) . (1, 0, 0) = 1
    |v1| = raiz(2), |v2| = 1
    cos(theta) = 1 / raiz(2)
    theta = 45 graus = pi/4 rad
    Resposta: alternativa c)

## Questao 7
    v1 . v2 = 0
    (-3, m, 4) . (2, 1, 1) = 0
    -6 + m + 4 = 0
    m - 2 = 0
    m = 2
    Resposta: alternativa b)

## Questao 8
    P = A + t v
    t pertence aos reais e multiplica o vetor diretor v.
    Resposta: alternativa b)

## Questao 9
    x = t
    y = -2t + 5
    z = 4t - 1
    v = (1, -2, 4)
    Resposta: alternativa c)

## Questao 10
    (x - 5)/(-4) = y/2 = z + 3
    z + 3 = (z + 3)/1
    v = (-4, 2, 1)
    Resposta: alternativa c)
"""


def lista_03() -> str:
    return f"""
# Lista 03 - Resolucao
Aluna: {STUDENT}

## Questao 1
    A = (2, -1, 3), u = (1, 2, -1), v = (-2, 1, 3)
    (x, y, z) = (2, -1, 3) + h(1, 2, -1) + t(-2, 1, 3)
    x = 2 + h - 2t
    y = -1 + 2h + t
    z = 3 - h + 3t

## Questao 2
    P = (-1, 4, 2), n = (3, 2, -1)
    3(x - (-1)) + 2(y - 4) - (z - 2) = 0
    3(x + 1) + 2(y - 4) - z + 2 = 0
    3x + 3 + 2y - 8 - z + 2 = 0
    3x + 2y - z - 3 = 0

## Questao 3
1)
    P = (2, -1, 1) + h(1, 2, 0) + t(-1, 1, 3)
    x = 2 + h - t
    y = -1 + 2h + t
    z = 1 + 3t

2)
    u = (1, 2, 0), v = (-1, 1, 3)
    u x v = (2 . 3 - 0 . 1, 0 . (-1) - 1 . 3, 1 . 1 - 2 . (-1))
    u x v = (6, -3, 3) = 3(2, -1, 1)
    n = (2, -1, 1)
    2(x - 2) - (y + 1) + (z - 1) = 0
    2x - 4 - y - 1 + z - 1 = 0
    2x - y + z - 6 = 0

## Questao 4
    AB = B - A = (0 - 2, 3 - 1, 1 - 0) = (-2, 2, 1)
    AC = C - A = (1 - 2, -1 - 1, 4 - 0) = (-1, -2, 4)
    AB x AC = (2 . 4 - 1 . (-2), 1 . (-1) - (-2) . 4, (-2) . (-2) - 2 . (-1))
    AB x AC = (10, 7, 6)
    10(x - 2) + 7(y - 1) + 6(z - 0) = 0
    10x - 20 + 7y - 7 + 6z = 0
    10x + 7y + 6z - 27 = 0
    (x, y, z) = (2, 1, 0) + h(-2, 2, 1) + t(-1, -2, 4)

## Questao 5
    n1 = (2, -1, 1), n2 = (1, 2, -2)
    n1 . n2 = 2 . 1 + (-1) . 2 + 1 . (-2) = -2
    |n1 . n2| = 2
    |n1| = raiz(6), |n2| = 3
    cos(theta) = 2 / (3 raiz(6)) ~= 0,2722
    theta = arccos(0,2722) ~= 74,21 graus
"""


DOCUMENTS = {
    "Lista_01_Resolucao_Emilly_Thais_da_Costa.pdf": lista_01(),
    "Lista_02_Resolucao_Emilly_Thais_da_Costa.pdf": lista_02(),
    "Lista_03_Resolucao_Emilly_Thais_da_Costa.pdf": lista_03(),
}


def main() -> None:
    for filename, content in DOCUMENTS.items():
        renderer = DocumentRenderer()
        renderer.render(content, OUTPUT_DIR / filename)
        print(f"Gerado: {OUTPUT_DIR / filename}")


if __name__ == "__main__":
    main()
