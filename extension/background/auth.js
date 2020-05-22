const CLIENT_ID =
  '390532946027-h9t8vfp5c0hd0p2pnqvfj6t4otjh7c5i.apps.googleusercontent.com'
const REDIRECT_URL = chrome.identity.getRedirectURL()
const SCOPES = ['openid', 'email', 'profile']
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}&scope=${encodeURIComponent(SCOPES.join(' '))}`

const extractAccessToken = (redirectURI) => {
  const match = redirectURI.match(/[#?](.*)/)
  if (!match || match.length < 1) {
    return null
  }

  const params = new URLSearchParams(match[1].split('#')[0])
  return params.get('access_token')
}

const getAccessToken = (fetchUserInfoFunction) => {
  return chrome.identity.launchWebAuthFlow(
    {
      interactive: true,
      url: AUTH_URL,
    },
    fetchUserInfoFunction
  )
}

const getUserInfo = async (redirectURI) => {
  const accessToken = extractAccessToken(redirectURI)

  const requestURL = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
  const requestHeaders = new Headers()
  requestHeaders.append('Authorization', 'Bearer ' + accessToken)
  const driveRequest = new Request(requestURL, {
    method: 'GET',
    headers: requestHeaders,
  })

  const response = await fetch(driveRequest)
  if (response.status !== 200) {
    throw response.status
  }
  return response.json()
}
