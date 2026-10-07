# frozen_string_literal: true
require 'yaml'
require 'json'
require 'date'
require 'tzinfo'
root = File.expand_path('..', __dir__)
event = YAML.safe_load_file(File.join(root, '_data/event.yml'), permitted_classes: [Date, Time])
schedule = YAML.safe_load_file(File.join(root, '_data/schedule.yml'))
date = event['date'].to_s.strip
year = date.empty? ? event['year'] : Date.iso8601(date[0, 10]).year
name = event['name'].to_s.strip
base = name.sub(/\s+\d{4}\z/, '')
event['name'] = name.match?(/\s+\d{4}\z/) ? "#{base} #{year}" : name
event['year'] = year
event['lettered_name'] = base
event['title_date'] = date.empty? ? ' — date to be announced, ' : Date.iso8601(date[0, 10]).strftime(' %B %-d, ')
schedule.fetch('zones').each do |zone|
  next if date.empty? || zone['timezone'].to_s.strip.empty?
  offset = TZInfo::Timezone.get(zone['timezone']).period_for_utc(Time.utc(year, Date.iso8601(date[0, 10]).month, Date.iso8601(date[0, 10]).day, 12)).utc_total_offset / 3600.0
  abort("#{zone['label']}: fractional offsets are not supported by the current schedule") unless offset == offset.to_i
  zone['utc_offset'] = offset.to_i
end
{'generated_event' => event, 'generated_schedule' => schedule}.each do |file, value|
  File.write(File.join(root, "_data/#{file}.json"), JSON.pretty_generate(value) + "\n")
end
puts "Prepared event #{event['name']}; date #{date.empty? ? 'unconfirmed' : date}; time zones resolved."
