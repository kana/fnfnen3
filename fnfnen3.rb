# Fnfnen3, a web-based twitter client
# Version: @@VERSION@@
# Copyright (C) 2011 Kana Natsuno <http://whileimautomaton.net/>
# License: MIT license  {{{
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




class Fnfnen3 < Sinatra::Application
  ApplicationName = 'Fnfnen3'

  disable :logging
  enable :sessions

  before %r{^(?!/sign_in$)} do
    s = session

    if not (s[:request_token_token] and s[:request_token_secret]) then
      redirect to('/sign_in')
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
        redirect to('/sign_in')
      end
    end
  end

  get '/' do
    haml :index
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

  def callback_url
    url('/')
  end

  def consumer
    OAuth::Consumer.new(
      params[:consumer_key],
      params[:consumer_secret],
      :site => 'https://api.twitter.com/'
    )
  end
end




__END__
# vim: foldmethod=marker
