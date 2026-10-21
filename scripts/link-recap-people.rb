# frozen_string_literal: true
# Static presentation enrichment after Liquid has rendered the frozen program and recaps.
require 'json'
require 'nokogiri'
require 'uri'

root = File.expand_path('..', __dir__)
output = File.expand_path(ARGV.fetch(0))
people = JSON.parse(File.read(File.join(root, '_data/recap_people.json'))).fetch('people')
manifest = JSON.parse(File.read(File.join(root, 'docs/recaps/import-manifest.json')))
total = 0
manifest.fetch('routes').each do |route|
  key = route == '/events/october-17-2026/' ? 'index' : route.split('/').last
  names = {}
  people.each do |person|
    url = URI.parse(person.fetch('url'))
    raise "Invalid person URL: #{url}" unless %w[http https].include?(url.scheme) && url.host
    ([person.fetch('name')] + person.fetch('aliases', []) + person.fetch('page_aliases', {}).fetch(key, [])).each do |name|
      raise "Ambiguous person name: #{name}" if names.key?(name)
      names[name] = person.fetch('url')
    end
  end
  # Unicode boundaries preserve accents and possessives; longer names win over aliases.
  pattern = /(?<![\p{L}\p{N}_])(?:#{names.keys.sort_by { |name| -name.length }.map { |name| Regexp.escape(name) }.join('|')})(?![\p{L}\p{N}_])/
  path = File.join(output, route, 'index.html')
  doc = Nokogiri::HTML5(File.read(path))
  main = doc.at_css('main') or raise "Missing main in #{route}"
  before_text = main.text
  before_links = main.css('a').map(&:to_html)
  count = 0
  main.xpath('.//text()').each do |node|
    # Keep session cards, resource links and interactive controls intact.
    next if node.ancestors.any? { |parent| %w[a script style code pre summary button select textarea].include?(parent.name) }
    text = node.text
    offset = 0
    text.to_enum(:scan, pattern).each do
      match = Regexp.last_match
      node.add_previous_sibling(Nokogiri::XML::Text.new(text[offset...match.begin(0)], doc))
      link = Nokogiri::XML::Node.new('a', doc)
      link['href'] = names.fetch(match[0])
      link['class'] = 'recap-person-link'
      link.content = match[0]
      node.add_previous_sibling(link)
      offset = match.end(0)
      count += 1
    end
    next if offset.zero?
    node.add_previous_sibling(Nokogiri::XML::Text.new(text[offset..], doc))
    node.remove
  end
  raise "Wording changed in #{route}" unless main.text == before_text
  # The before list includes links from a previous run, making this check idempotent too.
  after_existing = main.css('a').reject { |link| link['class'] == 'recap-person-link' }.map(&:to_html)
  before_existing = before_links.reject { |html| html.include?('class="recap-person-link"') }
  raise "Existing link changed in #{route}" unless after_existing == before_existing
  raise "Nested link in #{route}" unless main.css('a a').empty?
  File.write(path, doc.to_html) if count.positive?
  total += count
end
puts "Linked #{total} person mentions across #{manifest.fetch('routes').size} archive pages; wording and existing links preserved."
