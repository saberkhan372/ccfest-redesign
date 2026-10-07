# frozen_string_literal: true
require 'tmpdir'
require 'fileutils'
require_relative 'validate-content'
require 'json'
require 'minitest/autorun'

class ContentRegressionTest < Minitest::Test
  ROOT = File.expand_path('..', __dir__)
  def setup
    @dir = Dir.mktmpdir('ccfest-content-')
    FileUtils.cp(File.join(ROOT, '.pages.yml'), @dir)
    FileUtils.cp_r(File.join(ROOT, '_data'), @dir)
    FileUtils.mkdir_p(File.join(@dir, 'scripts'))
    %w[content-removals.yml prepare-event.rb].each { |name| FileUtils.cp(File.join(ROOT, 'scripts', name), File.join(@dir, 'scripts')) }
    FileUtils.ln_s(File.join(ROOT, 'assets'), File.join(@dir, 'assets'))
    FileUtils.ln_s(File.join(ROOT, '.git'), File.join(@dir, '.git'))
  end
  def teardown
    FileUtils.remove_entry(@dir)
  end
  def change(name)
    file = File.join(@dir, '_data', "#{name}.yml")
    value = YAML.safe_load_file(file, permitted_classes: [Date, Time])
    yield value
    File.write(file, value.to_yaml)
  end
  def errors(baseline: nil)
    CCContent::Validator.new(@dir, baseline: baseline).validate.errors.join("\n")
  end
  def test_current_content_passes
    assert_empty errors
  end
  def test_new_workshop_with_no_round_or_language_is_valid
    change('sessions') { |d| d['sessions'] << {'id' => 'new-confirmed-workshop', 'title' => 'A newly confirmed workshop', 'format' => 'Workshop', 'presenters' => [{'name' => 'Confirmed presenter'}]} }
    assert_empty errors
  end
  def test_original_cms_loss_fails
    change('sessions') { |data| data['sessions'].each { |s| %w[id format schedule_id level language].each { |key| s.delete(key) } } }
    assert_match(/required value|session IDs/, errors)
  end
  def test_recursive_schema_catches_undeclared_presenter_fields
    change('sessions') { |d| d['sessions'][0]['presenters'][0]['new_bio'] = 'CMS would drop this' }
    assert_match(/new_bio.*not declared/, errors)
  end
  def test_missing_and_empty_rounds_are_valid_pending_workshops
    change('sessions') { |d| workshops = d['sessions'].select { |s| s['format'] == 'Workshop' }; workshops[0].delete('schedule_id'); workshops[1]['schedule_id'] = '' }
    assert_empty errors
  end
  def test_unknown_padded_or_panel_rounds_fail
    %w[round-99 panel].concat([' round-1 ']).each do |round|
      change('sessions') { |d| d['sessions'].find { |s| s['format'] == 'Workshop' }['schedule_id'] = round }
      assert_match(/choose|workshops block/, errors)
    end
  end
  def test_duplicate_ids_fail
    change('sessions') { |d| d['sessions'][1]['id'] = d['sessions'][0]['id'] }
    assert_match(/unique/, errors)
  end
  def test_bad_schedule_time_and_overlap_fail
    change('schedule') { |d| d['items'][0]['start'] = '29:00' }
    assert_match(/format/, errors)
    change('schedule') { |d| d['items'][0]['start'] = '09:00'; d['items'][0]['end'] = '10:00' }
    assert_match(/overlap/, errors)
  end
  def test_missing_image_and_unsafe_markdown_link_fail
    change('sessions') { |d| d['sessions'][0]['presenters'][0]['photo'] = 'assets/not-present.png'; d['sessions'][0]['presenters'][0]['bio'] = '[click](javascript:alert)' }
    assert_match(/existing local asset/, errors)
    assert_match(/link scheme/, errors)
  end
  def test_unknown_copy_token_and_timezone_fail
    change('home') { |d| d['home_hero']['body'] = '{unrecognized_token}' }
    assert_match(/unknown copy token/, errors)
    change('schedule') { |d| d['zones'][0]['timezone'] = 'Imaginary/Zone' }
    # Structural errors return first; make copy valid to reach semantic validation.
    change('home') { |d| d['home_hero']['body'] = 'Valid copy' }
    assert_match(/unknown IANA/, errors)
  end
  def test_schema_round_trip_preserves_every_current_field
    config = YAML.safe_load_file(File.join(@dir, '.pages.yml'))
    project = lambda do |value, fields|
      fields.each_with_object({}) do |field, result|
        name = field.fetch('name')
        next unless value.key?(name)
        content = value[name]
        result[name] = if field['type'] == 'object'
          field['list'] ? content.map { |entry| project.call(entry, field.fetch('fields')) } : project.call(content, field.fetch('fields'))
        else
          content
        end
      end
    end
    config.fetch('content').each do |form|
      original = YAML.safe_load_file(File.join(@dir, form.fetch('path')), permitted_classes: [Date, Time])
      serialized = YAML.safe_load(project.call(original, form.fetch('fields')).to_yaml, permitted_classes: [Date, Time])
      assert_equal original, serialized, "#{form['name']}: schema projection drops data"
    end
  end
  def test_deployed_ids_are_protected_but_reordering_is_allowed
    baseline, status = Open3.capture2('git', '-C', ROOT, 'rev-parse', 'HEAD')
    assert status.success?
    baseline = baseline.strip
    change('sessions') { |d| d['sessions'].reverse! }
    assert_empty errors(baseline: baseline)
    removed = nil
    change('sessions') { |d| removed = d['sessions'].pop['id'] }
    assert_match(/removed or changed/, errors(baseline: baseline))
    File.write(File.join(@dir, 'scripts/content-removals.yml'), {'baseline' => baseline, 'session_ids' => [removed]}.to_yaml)
    assert_empty errors(baseline: baseline)
  end
  def test_confirmed_date_derives_year_and_daylight_saving
    change('event') { |d| d['date'] = '2027-12-17' }
    output, status = Open3.capture2e('ruby', File.join(@dir, 'scripts/prepare-event.rb'))
    assert status.success?, output
    event = JSON.parse(File.read(File.join(@dir, '_data/generated_event.json')))
    schedule = JSON.parse(File.read(File.join(@dir, '_data/generated_schedule.json')))
    assert_equal 'Virtual CC Fest 2027', event['name']
    assert_equal 2027, event['year']
    assert_equal ' December 17, ', event['title_date']
    assert_equal [-8, -5], schedule['zones'].map { |z| z['utc_offset'] }
    change('event') { |d| d['date'] = '' }
    _, status = Open3.capture2e('ruby', File.join(@dir, 'scripts/prepare-event.rb'))
    assert status.success?
    assert_match(/to be announced/, JSON.parse(File.read(File.join(@dir, '_data/generated_event.json')))['title_date'])
  end
end
