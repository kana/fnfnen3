# Fnfnen3, a web-based twitter client
# Version: @@VERSION@@
# Copyright (C) 2011 Kana Natsuno <http://whileimautomaton.net/>
# License: So-called MIT/X license  {{{
#     Permission is hereby granted, free of charge, to any person
#     obtaining a copy of this software and associated documentation
#     files (the "Software"), to deal in the Software without
#     restriction, including without limitation the rights to use,
#     copy, modify, merge, publish, distribute, sublicense, and/or
#     sell copies of the Software, and to permit persons to whom the
#     Software is furnished to do so, subject to the following
#     conditions:
#
#     The above copyright notice and this permission notice shall be
#     included in all copies or substantial portions of the Software.
#
#     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
#     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
#     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
#     NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
#     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
#     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
#     OTHER DEALINGS IN THE SOFTWARE.
# }}}

require 'haml'
require 'oauth'
require 'sinatra'
require 'twitter'




class Fnfnen3 < Sinatra::Application
  ApplicationName = 'Fnfnen3'

  disable :logging
  enable :sessions

  before %r{^(?!/(sign_in|sign_out)$)} do
    s = session

    if not (s[:request_token_token] and s[:request_token_secret]) then
      deny_unauthorized_access
    end

    if not (s[:access_token_token] and s[:access_token_secret]) then
      begin
        request_token = OAuth::RequestToken.new(
          consumer,
          s[:request_token_token],
          s[:request_token_secret],
        )
        access_token = request_token.get_access_token
        s[:access_token_token] = access_token.token
        s[:access_token_secret] = access_token.secret
        redirect to('/')
      rescue OAuth::Unauthorized
        deny_unauthorized_access
      end
    end
  end

  get '/' do
    haml :index
  end

  get '/api/:version/*.:format' do |version, api_name, format|
    call_twitter_api :get, version, api_name, format
  end

  post '/api/:version/*.:format' do |version, api_name, format|
    call_twitter_api :post, version, api_name, format
  end

  get '/sign_in' do
    haml :sign_in
  end

  post '/sign_in' do
    request_token = consumer.get_request_token :oauth_callback => callback_url

    session[:consumer_key] = params[:consumer_key]
    session[:consumer_secret] = params[:consumer_secret]
    session[:request_token_token] = request_token.token
    session[:request_token_secret] = request_token.secret
    session[:access_token_token] = nil
    session[:access_token_secret] = nil

    redirect request_token.authorize_url :oauth_callback => callback_url
  end

  get '/sign_out' do
    safe_keys = [:consumer_key, :consumer_secret]
    h = {}
    safe_keys.each do |k|
      h[k] = session[k]
    end

    session.clear

    safe_keys.each do |k|
      session[k] = h[k]
    end

    redirect to('/')
  end

  def access_token
    OAuth::AccessToken.new(
      consumer,
      session[:access_token_token],
      session[:access_token_secret]
    )
  end

  def call_twitter_api(method, version, api_name, format)
    parameters = request.query_string
    response = access_token.request(
      method,
      "http://api.twitter.com/#{version}/#{api_name}.#{format}?#{parameters}",
      request.body
    )
    [
      response.code.to_i,
      response.header.to_hash.keep_if {|k, _| k.downcase != 'status'},
      response.body
    ]
  end

  def callback_url
    url('/')
  end

  def consumer
    OAuth::Consumer.new(
      params[:consumer_key] || session[:consumer_key],
      params[:consumer_secret] || session[:consumer_secret],
      :site => 'https://api.twitter.com/'
    )
  end

  def deny_unauthorized_access
    if request.path_info.start_with? '/api'
      halt 403
    else
      redirect to('/sign_in')
    end
  end

  def twitter
    t = Twitter::Client.new

    t.consumer_key = session[:consumer_key]
    t.consumer_secret = session[:consumer_secret]
    t.oauth_token = session[:access_token_token]
    t.oauth_token_secret = session[:access_token_secret]

    t
  end
end




__END__
# vim: foldmethod=marker
