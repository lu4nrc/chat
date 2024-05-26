import React from "react";
import Markdown from "markdown-to-jsx";

const elements = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    // SVG
    "circle",
    "clipPath",
    "defs",
    "ellipse",
    "foreignObject",
    "g",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "stop",
    "svg",
    "text",
    "tspan",
];

const allowedElements = ["a", "b", "strong", "em", "u", "code", "del"];

const CustomLink = ({ children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

const MarkdownWrapper = React.memo(({ children }) => {
    // Expressões regulares refatoradas para serem mais eficientes
    const boldRegex = /\*([^*]+)\*/g;
    const tildaRegex = /~([^~]+)~/g;
    const removeGreaterThanRegex = /> \*([^*]+)\*/g;

    // Função para substituir o texto
    const replaceText = (text, regex, replacement) => text.replace(regex, replacement);

    // Função para remover o padrão "> *"
    const removeGreaterThanPattern = (text) => text.replace(removeGreaterThanRegex, "*$1*");

    if (!children) return null;

    // Opções do Markdown simplificadas e comentadas
    const options = {
        disableParsingRawHTML: true,
        forceInline: true,
        overrides: {
            a: { component: CustomLink },
            // Função para tratar elementos não permitidos
            ...elements.reduce((acc, element) => {
                if (!allowedElements.includes(element)) {
                    acc[element] = el => el.children || null;
                }
                return acc;
            }, {})
        },
    };

    // Aplicando transformações no texto
    let modifiedChildren = children;
    modifiedChildren = removeGreaterThanPattern(modifiedChildren);
    modifiedChildren = replaceText(modifiedChildren, boldRegex, "**$1**");
    modifiedChildren = replaceText(modifiedChildren, tildaRegex, "~~$1~~");

    return <Markdown options={options}>{modifiedChildren}</Markdown>;
});

export default MarkdownWrapper;