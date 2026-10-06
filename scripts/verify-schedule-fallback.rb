# Run with the same Ruby/Jekyll installation used to build the site:
# ruby scripts/verify-schedule-fallback.rb [source-directory]
require 'jekyll'
require 'nokogiri'
require 'tmpdir'
require 'fileutils'

source = File.expand_path(ARGV[0] || '..', ARGV[0] ? Dir.pwd : __dir__)
Dir.mktmpdir('ccfest-schedule-fallback-') do |tmp|
  tmp = File.realpath(tmp) # Jekyll safe-mode include paths must agree with macOS's real /private/var path.
  input = File.join(tmp, 'source')
  output = File.join(tmp, 'site')
  FileUtils.mkdir_p(input)
  %w[register _includes _layouts _data].each do |dir|
    FileUtils.cp_r(File.join(source, dir), input)
  end

  schedule = YAML.load_file(File.join(input, '_data/schedule.yml'))
  round = schedule.fetch('items').find { |item| item['kind'] == 'workshops' }.fetch('id')
  fixtures = [{ 'id' => 'assigned', 'title' => 'Assigned workshop', 'format' => 'Workshop', 'schedule_id' => round }]
  { 'missing' => nil, 'empty' => '', 'whitespace' => '   ' }.each do |name, value|
    session = { 'id' => name, 'title' => "Pending #{name}", 'format' => 'Workshop' }
    session['schedule_id'] = value unless value.nil?
    fixtures << session
    untitled = { 'id' => "untitled-#{name}", 'format' => 'Workshop', 'schedule_id' => value }
    untitled['title'] = value unless value.nil?
    fixtures << untitled
  end
  # A round that is not exactly the id of a workshop round also means "to be announced": mistyped,
  # padded with a space, removed, or the id of the panel block.
  { 'typo' => 'round-9', 'padded' => "#{round} ", 'panelish' => 'panel' }.each do |name, value|
    fixtures << { 'id' => name, 'title' => "Pending #{name}", 'format' => 'Workshop', 'schedule_id' => value }
  end
  fixtures << { 'id' => 'real-panel', 'title' => 'Fixture panel', 'format' => 'Panel', 'schedule_id' => 'panel', 'presenters' => [{ 'name' => 'Panelist One' }] }
  File.write(File.join(input, '_data/sessions.yml'), { 'sessions' => fixtures }.to_yaml)
  config = Jekyll.configuration('source' => input, 'destination' => output, 'safe' => true, 'quiet' => true)
  Jekyll::Site.new(config).process
  page = Nokogiri::HTML(File.read(File.join(output, 'register/index.html')))
  cards = page.css('.session-card')
  raise "Expected eight titled sessions (1 assigned, 6 pending, 1 panel), got #{cards.size}" unless cards.size == 8
  pending = page.css('.schedule-pending .session-card')
  raise "Missing, empty, whitespace, mistyped, padded and panel-id rounds must all render as pending, got #{pending.map { |c| c['data-id'] }.sort.inspect}" unless pending.map { |c| c['data-id'] }.sort == %w[empty missing padded panelish typo whitespace]
  raise 'The panel block must hold only the panel' unless page.css('#panel .session-card').map { |c| c['data-id'] } == ['real-panel']
  raise 'Pending workshops must have empty client-side round IDs' unless pending.all? { |c| c['data-block'] == '' }
  raise 'Assigned workshop moved out of its round' unless page.css("##{round} .session-card[data-id='assigned']").size == 1
  raise 'Untitled fixture rendered' unless page.css('[data-id^="untitled-"]').empty?
end
puts 'PASS: actual Jekyll rendering keeps every titled workshop visible (missing, empty, whitespace, mistyped, padded or panel-id rounds go under Round to be announced), keeps the panel block to panels, and skips untitled entries.'
