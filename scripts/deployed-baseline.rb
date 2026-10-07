# frozen_string_literal: true
# Resolve identity protection against the last SUCCESSFUL Pages deployment, not HEAD^.
require 'net/http'
require 'json'
require 'uri'
repo = ENV.fetch('GITHUB_REPOSITORY')
token = ENV.fetch('GH_TOKEN')
def github(path, token)
  uri = URI("https://api.github.com#{path}")
  request = Net::HTTP::Get.new(uri)
  request['Authorization'] = "Bearer #{token}"
  request['Accept'] = 'application/vnd.github+json'
  request['X-GitHub-Api-Version'] = '2022-11-28'
  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, open_timeout: 15, read_timeout: 30) { |http| http.request(request) }
  abort("Cannot determine deployed baseline: GitHub returned #{response.code}") unless response.is_a?(Net::HTTPSuccess)
  JSON.parse(response.body)
end
baseline = nil
(1..10).each do |page|
  deployments = github("/repos/#{repo}/deployments?environment=github-pages&per_page=100&page=#{page}", token)
  break if deployments.empty?
  deployments.each do |deployment|
    statuses = github("/repos/#{repo}/deployments/#{deployment.fetch('id')}/statuses?per_page=100", token)
    next unless statuses.any? { |status| status['state'] == 'success' }
    baseline = deployment.fetch('sha')
    break
  end
  break if baseline
end
# One-time bootstrap is the verified live recovery commit, used only if there are no
# successful deployment records. API errors above always fail closed.
baseline ||= ENV['CONTENT_BOOTSTRAP_BASELINE']
abort('No successful deployment baseline. Set a verified bootstrap commit before enabling publishing.') unless baseline&.match?(/\A[0-9a-f]{40}\z/)
puts baseline
