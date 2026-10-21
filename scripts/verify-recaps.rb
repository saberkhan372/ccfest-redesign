# frozen_string_literal: true
require 'json'
require 'nokogiri'
require 'uri'
require 'digest'
root = File.expand_path('..', __dir__)
built = File.expand_path(ARGV.fetch(0))
manifest = JSON.parse(File.read(File.join(root, 'docs/recaps/import-manifest.json')))
data = JSON.parse(File.read(File.join(root, '_data/recap_oct17.json')))
routes = manifest.fetch('routes')
raise 'Wrong route count' unless routes.size == 21
routes.each do |route|
  path = File.join(built, route, 'index.html')
  doc = Nokogiri::HTML5(File.read(path))
  raise "Missing H1: #{route}" unless doc.css('h1').size == 1
  raise "Missing description: #{route}" if doc.at_css('meta[name=description]')['content'].empty?
  raise "Missing canonical: #{route}" unless doc.at_css('link[rel=canonical]')['href'] == 'https://ccfest.rocks' + route
  raise "Archive indexing disabled: #{route}" if doc.at_css('meta[name=robots]')&.[]('content').to_s.include?('noindex')
  raise "Private evidence leaked: #{route}" if doc.at_css('main').text.match?(/Editorial evidence|RecordingnewChat|GMT2026|Source packet|confirm before publishing/)
  raise "Unconverted source: #{route}" if doc.to_html.match?(/notion-file-block:|<mention|<toggle|<image /)
  raise "Designer credits missing: #{route}" unless doc.at_css('.design-credits').text.include?('Francisca') && doc.at_css('.design-credits').text.include?('Shristi')
  doc.css('a[href], img[src], link[href], script[src]').each do |node|
    value = node['href'] || node['src']
    uri = URI.parse(value.gsub(' ', '%20'))
    next if uri.scheme || uri.host
    target = File.expand_path(URI::DEFAULT_PARSER.unescape(uri.path.empty? ? 'index.html' : uri.path.sub(%r{\A/}, '')), uri.path.start_with?('/') ? built : File.dirname(path))
    target = File.join(target, 'index.html') if File.directory?(target)
    raise "Missing local target #{value} from #{route}" unless File.file?(target)
    if uri.fragment && File.extname(target) == '.html'
      linked = target == path ? doc : Nokogiri::HTML5(File.read(target))
      raise "Missing anchor #{value} from #{route}" unless linked.at_css("[id='#{uri.fragment}']")
    end
  end
end
hub = Nokogiri::HTML5(File.read(File.join(built, routes.first, 'index.html')))
expected = routes.drop(1).reject { |route| route.end_with?('/program/') }
story = hub.css('.recap-connections a').map { |a| a['href'] }
raise 'Story does not link all 19 sessions exactly once' unless story.sort == expected.sort
raise 'Directory does not cover 19 sessions' unless hub.css('.recap-card').size == 19
JSON.parse(File.read(File.join(root, 'docs/recaps/media-manifest.json'))).each do |asset|
  file = File.join(root, asset.fetch('destination'))
  raise "Media hash mismatch #{file}" unless Digest::SHA256.file(file).hexdigest == asset.fetch('sha256')
end
data.fetch('sessions').each do |s|
  doc = Nokogiri::HTML5(File.read(File.join(built, routes.first, s.fetch('slug'), 'index.html')))
  raise "Replay missing #{s['slug']}" unless doc.css('a').any? { |a| a['href'] == s['replay'] }
  raise "Presenter information missing #{s['slug']}" unless doc.at_css('.recap-person')
end
raise 'Expected all 22 presenter profiles' unless data.fetch('sessions').sum { |s| Nokogiri::HTML5(File.read(File.join(built, routes.first, s.fetch('slug'), 'index.html'))).css('.recap-person').size } == 22
program = Nokogiri::HTML5(File.read(File.join(built, routes.first, 'program/index.html')))
raise 'Archive still has registration or planning controls' unless program.css('[data-luma-event], .schedule-mine, .schedule-tools, #registration').empty?
['index.html', 'events/index.html', 'history/index.html'].each do |path|
  doc = Nokogiri::HTML5(File.read(File.join(built, path)))
  raise "Stale registration link on #{path}" if doc.css('a').any? { |a| a['href'].to_s.match?(%r{(?:^|/)register/}) }
end
puts 'PASS 21 archive pages: metadata, local links/anchors, 19 story references, 19 replays, 10 image hashes, credits, and editorial exclusion.'
