# frozen_string_literal: true
# Deliberate, offline import of the selected reader-facing Notion snapshot.
require 'json'
require 'yaml'
require 'fileutils'
require 'cgi'
require 'kramdown'
require 'nokogiri'
require 'digest'

ROOT = File.expand_path('..', __dir__)
BASE = '/events/october-17-2026/'
data = JSON.parse(File.read(File.join(ROOT, '_data/recap_oct17.json')))
media = JSON.parse(File.read(File.join(ROOT, '_data/recap_media.json')))
sessions = data.fetch('sessions')
abort 'Expected 19 unique sessions' unless sessions.size == 19 && sessions.map { |s| s['id'] }.uniq.size == 19 && sessions.map { |s| s['slug'] }.uniq.size == 19
lookup = sessions.to_h { |s| [s.fetch('id'), s] }

def render(source, lookup, media)
  raise 'Editorial evidence crossed the public boundary' if source.match?(/Editorial evidence|RecordingnewChat|GMT2026|not yet destination-checked/)
  # Images resolve only through the reviewed local sidecar, never a signed Notion URL.
  source = source.gsub(/<image source="([^"]+)">\s*(.*?)\s*<\/image>/m) do
    url, alt = Regexp.last_match(1), Regexp.last_match(2)
    name = CGI.parse(URI.parse(url).query || '').fetch('name').first
    asset = media.fetch('notion_images').fetch(name)
    %(<figure class="recap-figure"><img src="#{asset.fetch('src')}" srcset="#{asset.fetch('small')} 720w, #{asset.fetch('src')} 1440w" sizes="(max-width: 800px) 100vw, 900px" width="#{asset.fetch('width')}" height="#{asset.fetch('height')}" alt="#{CGI.escapeHTML(alt)}" loading="lazy" decoding="async"></figure>)
  end
  source = source.gsub(/<toggle>\s*Explore these sessions\s*(.*?)<\/toggle>/m) do
    ids = Regexp.last_match(1).scan(/https:\/\/app.notion.com\/p\/([a-f0-9]+)/).flatten
    links = ids.map do |id|
      s = lookup.fetch(id)
      %(<a href="#{BASE}#{s.fetch('slug')}/"><span>#{CGI.escapeHTML(s.fetch('presenter'))}</span>#{CGI.escapeHTML(s.fetch('title'))} <span aria-hidden="true">↗</span></a>)
    end
    %(<nav class="recap-connections" aria-label="Related session recaps">#{links.join}</nav>)
  end
  # No unhandled Notion structures or source-supplied executable HTML.
  raise 'Unsupported source block' if source.match?(/<(?:script|style|iframe|video|page|mention|toggle|columns)\b|notion-file-block:/i)
  fragment = Nokogiri::HTML5.fragment(Kramdown::Document.new(source, input: 'GFM', hard_wrap: false).to_html)
  # Keep attribution visually separate without changing the quoted words.
  fragment.css('blockquote > p').each do |paragraph|
    match = paragraph.text.match(/\A(“.+”)\s+(Daniel Shiffman|Missy Cooper|David DeLiema|Lauren Lee McCarthy)\z/m)
    next unless match
    paragraph.content = match[1]
    attribution = Nokogiri::XML::Node.new('p', fragment.document)
    attribution['class'] = 'recap-quote-attribution'
    attribution.content = match[2]
    paragraph.add_next_sibling(attribution)
  end
  allowed = %w[p a em strong i b code pre h2 h3 h4 ul ol li blockquote figure img nav span br hr]
  fragment.traverse do |node|
    next unless node.element?
    raise "Unsupported HTML #{node.name}" unless allowed.include?(node.name)
    node.attributes.each_key do |key|
      raise "Unsafe attribute #{key}" unless %w[href src srcset sizes width height alt loading decoding class id aria-label aria-hidden].include?(key)
    end
    %w[href src].each do |key|
      next unless node[key]
      raise "Unsafe URL #{node[key]}" unless node[key].match?(%r{\A(?:https?://|/|\#|mailto:)})
    end
  end
  fragment.to_html
end

def write_page(path, front, html)
  FileUtils.mkdir_p(File.dirname(path))
  # Liquid never interprets source-provided examples or braces.
  raise 'Source contains Liquid raw delimiter' if html.include?('{% endraw %}')
  File.write(path, front.to_yaml + "---\n{% raw %}\n" + html + "\n{% endraw %}\n")
end

require 'uri'
event = data.fetch('event')
story = event.fetch('markdown')
raise 'Every session must be referenced in the story' unless lookup.keys.all? { |id| story.include?(id) }
# Cover and standfirst are rendered by the shared layout.
story = story.sub(/\A<i>.*?<\/i>\s*/m, '').sub(/\A<image.*?<\/image>\s*<i>.*?<\/i>\s*/m, '')
parts = story.split(/^## /).reject { |p| p.strip.empty? }
toc = []
html = parts.each_with_index.map do |part, i|
  title, md = part.split("\n", 2)
  id = "chapter-#{i + 1}"
  toc << { 'id' => id, 'title' => title.strip }
  %(<section class="recap-section" id="#{id}" aria-labelledby="#{id}-title"><p class="eyebrow">#{format('%02d', i + 1)}</p><h2 id="#{id}-title">#{CGI.escapeHTML(title.strip)}</h2>#{render(md, lookup, media)}</section>)
end.join("\n")
front = { 'layout' => 'recap', 'body_class' => 'inner-page recap-page', 'root' => '../../', 'home_href' => '../../', 'nav_current' => 'events', 'title' => 'Ten years of CC Fest — October 17, 2026', 'description' => event.fetch('description'), 'heading' => event.fetch('title'), 'noindex' => false, 'recap_kind' => 'event', 'toc' => toc }
write_page(File.join(ROOT, BASE, 'index.html'), front, html)

sessions.each do |session|
  id = session.fetch('slug')
  front = { 'layout' => 'recap', 'body_class' => 'inner-page recap-page recap-session-page', 'root' => '../../../', 'home_href' => '../../../', 'nav_current' => 'events', 'title' => "#{session.fetch('title')} — CC Fest", 'description' => "#{session.fetch('presenter')}: #{session.fetch('title')}. Recap, replay, takeaways and resources from CC Fest on October 17, 2026.", 'heading' => session.fetch('title'), 'noindex' => false, 'recap_kind' => 'session', 'session_id' => id }
  html = render(session.fetch('markdown'), lookup, media)
  write_page(File.join(ROOT, BASE, id, 'index.html'), front, html)
end
manifest = { 'source' => '_data/recap_oct17.json', 'sha256' => Digest::SHA256.file(File.join(ROOT, '_data/recap_oct17.json')).hexdigest, 'routes' => [BASE] + sessions.map { |s| BASE + s['slug'] + '/' } + [BASE + 'program/'], 'source_pages' => [event['source_url']] + sessions.map { |s| s['source_url'] }, 'preview_only' => false }
FileUtils.mkdir_p(File.join(ROOT, 'docs/recaps'))
File.write(File.join(ROOT, 'docs/recaps/import-manifest.json'), JSON.pretty_generate(manifest) + "\n")
puts 'Imported one event story and 19 session pages; editorial evidence excluded.'
