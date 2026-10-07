# frozen_string_literal: true
require_relative 'validate-content'
require 'json'
source = File.expand_path(ARGV[0] || File.join(__dir__, '..'))
output = File.expand_path(ARGV[1] || File.join(source, '_site'))
data = CCContent::Validator.new(source).validate
abort(data.errors.join("\n")) unless data.errors.empty?
sessions = data.data.fetch('sessions').fetch('sessions').select { |s| !s['title'].to_s.strip.empty? }
page = Nokogiri::HTML(File.read(File.join(output, 'register/index.html')))
cards = page.css('.session-card')
abort('Rendered session count does not match validated source') unless cards.size == sessions.size
sessions.each do |session|
  matching = cards.select { |card| card['data-id'] == session['id'] }
  abort("Session #{session['id']} must render exactly once") unless matching.size == 1
  card = matching.first
  abort("Wrong title/format for #{session['id']}") unless card['data-title'] == session['title'] && card['data-format'] == session['format']
  if session['schedule_id'].to_s.strip.empty?
    abort("Pending session #{session['id']} needs the pending section and no round ID") unless card.ancestors.any? { |node| node['class'].to_s.split.include?('schedule-pending') } && card['data-block'].to_s.empty?
  else
    abort("Wrong round for #{session['id']}") unless card.ancestors.any? { |node| node['id'] == session['schedule_id'] }
  end
end
keynotes = data.data.fetch('keynotes').fetch('keynotes').select { |k| !k['name'].to_s.strip.empty? }
unless keynotes.empty?
  headings = page.css('.keynote-card h3').map { |node| node.text.strip }
  abort('Keynote cards do not match published speakers') unless headings == keynotes.map { |k| k['name'] }
end
expected_blocks = data.data.fetch('schedule').fetch('items').map { |b| b['id'] }
abort('Rendered running order does not match source') unless page.css('.schedule-block').map { |b| b['id'] } == expected_blocks
Dir.glob(File.join(output, '**/index.html')).each do |file|
  html = Nokogiri::HTML(File.read(file))
  abort("Missing title, description or one H1: #{file}") unless html.css('h1').size == 1 && !html.at_css('title')&.text.to_s.strip.empty? && !html.at_css('meta[name="description"]')&.[]('content').to_s.strip.empty?
  html.css('img[src]').each do |img|
    next if img['src'].match?(%r{\A(?:https?:|data:)})
    image_path = URI::DEFAULT_PARSER.unescape(img['src'].split(/[?#]/).first)
    target = image_path.start_with?('/') ? File.join(output, image_path.delete_prefix('/')) : File.expand_path(image_path, File.dirname(file))
    abort("Missing built image #{img['src']} in #{file}") unless File.file?(target)
  end
end
puts "PASS rendered content: all #{sessions.size} sessions appear once in the correct location; page metadata and images resolve."
