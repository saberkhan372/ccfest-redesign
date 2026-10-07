# frozen_string_literal: true
require 'yaml'
require 'date'
require 'uri'
require 'pathname'
require 'optparse'
require 'open3'
require 'kramdown'
require 'nokogiri'
require 'tzinfo'

module CCContent
  class Validator
    attr_reader :errors, :warnings, :data
    def initialize(root, baseline: nil)
      @root = File.expand_path(root)
      @baseline = baseline
      @errors, @warnings, @data = [], [], {}
    end

    def fail_at(path, message)
      @errors << "#{path}: #{message}"
    end

    def text(value)
      value.to_s.strip
    end

    def load_yaml(path)
      content = File.read(File.join(@root, path), encoding: 'UTF-8')
      inspect_keys(Psych.parse_stream(content), path)
      YAML.safe_load(content, permitted_classes: [Date, Time], aliases: false) || {}
    rescue Psych::Exception, Errno::ENOENT => error
      fail_at(path, error.message)
      {}
    end

    def inspect_keys(node, path)
      if node.is_a?(Psych::Nodes::Mapping)
        keys = node.children.each_slice(2).map { |key, _| key.respond_to?(:value) ? key.value : key.to_s }
        keys.group_by(&:itself).each { |key, occurrences| fail_at(path, "duplicate YAML key #{key.inspect}") if occurrences.size > 1 }
      end
      Array(node.respond_to?(:children) ? node.children : nil).each { |child| inspect_keys(child, path) }
    end

    def schema(value, fields, path)
      return fail_at(path, 'expected an object') unless value.is_a?(Hash)
      known = fields.to_h { |field| [field.fetch('name'), field] }
      (value.keys - known.keys).each { |key| fail_at("#{path}.#{key}", 'not declared in .pages.yml; a CMS save could delete this field') }
      known.each do |key, field|
        v = value[key]
        p = "#{path}.#{key}"
        fail_at(p, 'required value is empty') if field['required'] && (v.nil? || v == [] || text(v).empty?)
        next if v.nil?
        if field['list']
          unless v.is_a?(Array)
            fail_at(p, 'expected a list')
            next
          end
          v.each_with_index { |entry, index| field_type(entry, field, "#{p}[#{index + 1}]") }
        else
          field_type(v, field, p)
        end
      end
    end

    def field_type(value, field, path)
      type = field.fetch('type')
      if type == 'object'
        schema(value, field.fetch('fields'), path)
      elsif type == 'number'
        fail_at(path, 'expected a number') unless value.is_a?(Numeric)
      elsif type == 'boolean'
        fail_at(path, 'expected true or false') unless value == true || value == false
      elsif type == 'date'
        Date.iso8601(text(value)[0, 10]) unless text(value).empty?
      else
        fail_at(path, 'expected text') unless value.is_a?(String)
        unless text(value).empty?
          pattern = field['pattern']
          fail_at(path, 'does not match the expected format') if pattern && !Regexp.new(pattern).match?(value.to_s)
          choices = field.dig('options', 'values')
          choices = choices.map { |choice| choice.is_a?(Hash) ? choice['value'] : choice } if choices
          fail_at(path, "choose #{choices.join(', ')}") if choices && !choices.include?(value)
          image(value, path) if type == 'image'
          links(value, path) if %w[text rich-text].include?(type)
          url(value, path, relative: true) if field['name'].match?(/(?:\Aurl\z|_url\z|\Alinkedin\z)/)
        end
      end
    rescue ArgumentError => error
      fail_at(path, error.message)
    end

    def image(value, path)
      target = File.expand_path(value.to_s.sub(%r{\A/}, ''), @root)
      fail_at(path, 'image must be an existing local asset') unless target.start_with?("#{@root}/assets/") && File.file?(target)
    end

    def url(value, path, relative: false)
      v = text(value)
      return if v.empty?
      return if relative && v.match?(%r{\A(?:/?(?:assets|events|register|past-events|mailing-list|code-of-conduct)/|#|\.{0,2}/)}) && !v.start_with?('//')
      return if relative && v.match?(%r{\A[a-z0-9][a-z0-9-]*(?:/[a-z0-9][a-z0-9-]*)*/\z})
      uri = URI.parse(v)
      if uri.scheme.nil?
        @warnings << "#{path}: verify this legacy link and include https:// (#{v})"
      elsif !%w[http https mailto].include?(uri.scheme.downcase)
        fail_at(path, 'link scheme must be https, http or mailto')
      elsif %w[http https].include?(uri.scheme.downcase) && (uri.host.nil? || uri.host.empty?)
        fail_at(path, 'web link needs a host')
      end
    rescue URI::InvalidURIError
      if v.match?(%r{\Ahttps?://}) && v.include?(',')
        @warnings << "#{path}: contains multiple legacy URLs; choose or separate verified links"
      else
        fail_at(path, 'invalid link')
      end
    end

    def links(value, path)
      substitutions = {'contact_email' => 'editor@example.org', 'organizer_name' => 'Organizer', 'event_name' => 'CC Fest', 'event_year' => '2026', 'camp_description' => 'Camp description', 'camp_eyebrow' => 'Camp', 'round_count' => 'two'}
      copy = value.to_s.gsub(/\{([a-z_]+)\}/) do
        fail_at(path, "unknown copy token #{$1}") unless substitutions.key?($1)
        substitutions.fetch($1, '')
      end
      html = Kramdown::Document.new(copy, input: 'GFM').to_html
      Nokogiri::HTML.fragment(html).css('a[href]').each { |anchor| url(anchor['href'], path, relative: true) }
    end

    def rows(file, key)
      value = @data.dig(file, key)
      return value if value.is_a?(Array)
      fail_at("_data/#{file}.yml.#{key}", 'expected a list')
      []
    end

    def validate
      config = load_yaml('.pages.yml')
      forms = Array(config['content'])
      forms.each do |form|
        path = form['path']
        next unless path&.start_with?('_data/')
        @data[File.basename(path, '.yml')] = load_yaml(path)
        schema(@data[File.basename(path, '.yml')], Array(form['fields']), path)
      end
      Dir.glob(File.join(@root, '_data/*.yml')).each do |path|
        name = File.basename(path, '.yml')
        fail_at("_data/#{name}.yml", 'missing CMS form') unless @data.key?(name)
      end
      return self unless @errors.empty?
      blocks = rows('schedule', 'items')
      ids = blocks.map { |item| text(item['id']) }
      fail_at('_data/schedule.yml.items', 'block IDs must be nonempty and unique') if ids.any?(&:empty?) || ids.uniq.size != ids.size
      previous_end = -1
      blocks.each_with_index do |item, index|
        p = "_data/schedule.yml.items[#{index + 1}]"
        fail_at(p, 'kind must be keynote, workshops or panel') unless %w[keynote workshops panel].include?(item['kind'])
        times = %w[start end].map do |key|
          str = text(item[key])
          fail_at("#{p}.#{key}", 'use HH:MM, from 00:00 to 23:59') unless str.match?(/\A(?:[01]\d|2[0-3]):[0-5]\d\z/)
          str.split(':').map(&:to_i).then { |hour, minute| hour.to_i * 60 + minute.to_i }
        end
        fail_at(p, 'end must follow start; blocks must run in chronological order without overlap') if times[1] <= times[0] || times[0] < previous_end
        previous_end = times[1]
      end
      by_id = blocks.to_h { |item| [item['id'], item] }
      sessions = rows('sessions', 'sessions')
      published = sessions.select { |session| !text(session['title']).empty? }
      ids = published.map { |session| text(session['id']) }
      fail_at('_data/sessions.yml.sessions', 'published session IDs must be nonempty and unique') if ids.any?(&:empty?) || ids.uniq.size != ids.size
      published.each do |session|
        p = "_data/sessions.yml session #{session['id'].inspect}"
        format = session['format']
        fail_at(p, 'format must be Workshop or Panel') unless %w[Workshop Panel].include?(format)
        assigned = text(session['schedule_id'])
        expected = format == 'Panel' ? 'panel' : 'workshops'
        next if assigned.empty? && format == 'Workshop'
        fail_at(p, "schedule_id must exactly match a #{expected} block (blank is allowed for a pending workshop)") unless by_id.dig(session['schedule_id'], 'kind') == expected
      end
      rows('keynotes', 'keynotes').each do |keynote|
        next if text(keynote['name']).empty?
        fail_at("_data/keynotes.yml #{keynote['name']}", 'schedule_id must match a keynote block') unless by_id.dig(keynote['schedule_id'], 'kind') == 'keynote'
      end
      session_form = forms.find { |form| form['name'] == 'sessions' }
      options = session_form&.dig('fields')&.first&.dig('fields')&.find { |field| field['name'] == 'schedule_id' }&.dig('options', 'values')
      values = Array(options).map { |option| option.is_a?(Hash) ? option['value'] : option }
      expected = blocks.select { |block| %w[workshops panel].include?(block['kind']) }.map { |block| block['id'] }
      fail_at('.pages.yml sessions.When', 'options must match workshop/panel block IDs') unless values.sort == expected.sort
      zones = rows('schedule', 'zones')
      zones.each { |zone| fail_at('_data/schedule.yml.zones', 'UTC offsets must be whole hours between -12 and +14') unless zone['utc_offset'].is_a?(Integer) && (-12..14).cover?(zone['utc_offset']) }
      zones.each do |zone|
        next if text(zone['timezone']).empty?
        begin
          TZInfo::Timezone.get(zone['timezone'])
        rescue TZInfo::InvalidTimezoneIdentifier
          fail_at('_data/schedule.yml.zones', "unknown IANA time zone #{zone['timezone'].inspect}")
        end
      end
      event = @data['event']
      if text(event['date']).empty? && (!event['year'].is_a?(Integer) || !(1900..2200).cover?(event['year']))
        fail_at('_data/event.yml.year', 'an unconfirmed date needs a fallback year')
      end
      fail_at('_data/camps.yml.camps', 'Visible Java requires its permanent camp ID') unless rows('camps', 'camps').any? { |camp| camp['id'] == 'visible-java' }
      ld_email = @data.dig('site', 'email').to_s
      fail_at('_data/site.yml.email', 'use a valid contact email') unless ld_email.match?(/\A[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+\z/)
      host = text(@data.dig('site', 'mailing_list', 'embed_host'))
      form_id = text(@data.dig('site', 'mailing_list', 'embed_form_id'))
      fail_at('_data/site.yml.mailing_list', 'embed needs an EmailOctopus host and safe form ID') if !form_id.empty? && (!host.match?(/\Aeomail\d*\.com\z/) || !form_id.match?(/\A[a-zA-Z0-9-]+\z/))
      fail_at('_data/schedule.yml.zones', 'at least one time zone is required for a schedule') if !blocks.empty? && zones.empty?
      identity(published) if @baseline
      self
    end

    def identity(published)
      content, status = Open3.capture2('git', '-c', "safe.directory=#{@root}", '-C', @root, 'show', "#{@baseline}:_data/sessions.yml")
      return fail_at('baseline', 'cannot load sessions from the specified successful commit') unless status.success?
      previous = YAML.safe_load(content, permitted_classes: [Date, Time], aliases: false).fetch('sessions')
      removals = load_yaml('scripts/content-removals.yml')
      allowed = removals['baseline'] == @baseline ? Array(removals['session_ids']) : []
      missing = previous.select { |s| !text(s['title']).empty? }.map { |s| s['id'] } - published.map { |s| s['id'] }
      (missing - allowed).each { |id| fail_at('_data/sessions.yml', "published ID #{id.inspect} was removed or changed; restore it or document an intentional removal for baseline #{@baseline} in scripts/content-removals.yml") }
    rescue Psych::Exception, KeyError => error
      fail_at('baseline', error.message)
    end
  end
end

if $PROGRAM_NAME == __FILE__
  options = { root: File.expand_path('..', __dir__) }
  OptionParser.new do |parser|
    parser.on('--source PATH') { |value| options[:root] = value }
    parser.on('--baseline SHA') { |value| options[:baseline] = value }
  end.parse!
  result = CCContent::Validator.new(options[:root], baseline: options[:baseline]).validate
  result.warnings.uniq.each { |warning| warn "WARNING #{warning}" }
  result.errors.uniq.each { |error| warn "ERROR #{error}" }
  if ENV['GITHUB_STEP_SUMMARY']
    File.open(ENV['GITHUB_STEP_SUMMARY'], 'a') do |summary|
      summary.puts "### Content checks\n\nBaseline: `#{options[:baseline] || 'not supplied'}`.\n"
      summary.puts(result.errors.empty? ? "\nSource/schema checks passed for #{result.data.size} CMS files.\n" : "\nPublication blocked. Restore the listed fields or document intentional removals.\n")
      (result.errors.uniq.map { |e| "ERROR #{e}" } + result.warnings.uniq.map { |w| "WARNING #{w}" }).each { |line| summary.puts "\n- #{line.gsub(/[`<>]/, '')}" }
    end
  end
  if result.errors.empty?
    puts "PASS content: #{result.data.size} CMS files; source/schema, identities, assignments, assets and links checked."
  end
  exit(result.errors.empty? ? 0 : 1)
end
