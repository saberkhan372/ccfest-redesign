# frozen_string_literal: true
# Prove reconciliation rejects a successful Jekyll build that quietly loses cards.
require 'tmpdir'
require 'fileutils'
require 'nokogiri'
require 'open3'
root = File.expand_path('..', __dir__)
output = File.expand_path(ARGV.fetch(0, '_site'))
original = File.read(File.join(output, 'register/index.html'))
Dir.mktmpdir('ccfest-rendered-') do |temp|
  Dir.children(output).each { |name| FileUtils.ln_s(File.join(output, name), File.join(temp, name)) unless name == 'register' }
  FileUtils.mkdir_p(File.join(temp, 'register'))
  check = lambda do |html, expected|
    File.write(File.join(temp, 'register/index.html'), html)
    log, status = Open3.capture2e('ruby', File.join(root, 'scripts/verify-rendered-content.rb'), root, temp)
    abort("Reconciliation regression: expected #{expected.inspect}, got #{log}") if status.success? || !log.include?(expected)
  end
  page = Nokogiri::HTML(original)
  page.at_css('.session-card').remove
  check.call(page.to_html, 'count does not match')
  page = Nokogiri::HTML(original)
  cards = page.css('.session-card')
  cards[1]['data-id'] = cards[0]['data-id']
  check.call(page.to_html, 'exactly once')
  page = Nokogiri::HTML(original)
  page.at_css('.session-card')['data-title'] = 'Incorrect title'
  check.call(page.to_html, 'Wrong title/format')
end
puts 'PASS reconciliation regressions: omitted cards, duplicate identities and changed titles are rejected.'
