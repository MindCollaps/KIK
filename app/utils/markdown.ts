import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
});

const defaultLinkRenderer = markdown.renderer.rules.link_open
    ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx]?.attrGet('href') ?? '';
    if (/^https?:\/\//.test(href)) {
        tokens[idx]?.attrSet('target', '_blank');
        tokens[idx]?.attrSet('rel', 'noreferrer noopener');
    }
    return defaultLinkRenderer(tokens, idx, options, env, self);
};

export function renderMarkdown(content: string) {
    return markdown.render(content);
}
