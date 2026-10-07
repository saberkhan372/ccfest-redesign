# frozen_string_literal: true
require 'fileutils'
require 'yaml'
root = File.expand_path('..', __dir__)
output = File.expand_path(ARGV[0] || '_site', root)
Dir.chdir(root) do
  validation = ['bundle', 'exec', 'ruby', 'scripts/validate-content.rb']
  validation += ['--baseline', ENV['CONTENT_BASELINE']] unless ENV['CONTENT_BASELINE'].to_s.empty?
  abort('Content validation failed') unless system(*validation)
  abort('Event preparation failed') unless system('bundle', 'exec', 'ruby', 'scripts/prepare-event.rb')
  abort('Typography generation failed') unless system('node', 'scripts/sync-typography.cjs')
  revision = ENV.fetch('GITHUB_SHA', '')
  File.write('_config.build.yml', {'github' => {'build_revision' => revision}}.to_yaml)
  abort('Jekyll build failed') unless system('bundle', 'exec', 'jekyll', 'build', '--safe', '--config', '_config.yml,_config.build.yml', '--destination', output)
  abort('Rendered content verification failed') unless system('bundle', 'exec', 'ruby', 'scripts/verify-rendered-content.rb', root, output)
ensure
  FileUtils.rm_f('_config.build.yml')
end
