var firebaseConfig = {
  apiKey: 'AIzaSyAGDcE1JIePpzJ66lRlIKDyY87aykZNjQ8',
  authDomain: 'meet-queue.firebaseapp.com',
  databaseURL: 'https://meet-queue.firebaseio.com',
  projectId: 'meet-queue',
  storageBucket: 'meet-queue.appspot.com',
  messagingSenderId: '539893296334',
  appId: '1:539893296334:web:b604f203bc04fe8825b49f',
  measurementId: 'G-19MMWPTZ20',
}

firebase.initializeApp(firebaseConfig)
const provider = new firebase.auth.GoogleAuthProvider()

const startAuth = () => {
  return chrome.identity.getAuthToken({ interactive: true }, (token) => {
    return token ? signInWithIdentityToken(token) : signInWithPopup()
  })
}

const signInWithIdentityToken = async (token) => {
  const credential = firebase.auth.GoogleAuthProvider.credential(null, token)
  try {
    return firebase.auth().signInWithCredential(credential)
  } catch (err) {
    err.code === 'auth/invalid-credential' && clearCachedIdentityToken(token)
  }
}

const signInWithPopup = () => {
  return firebase.auth().signInWithPopup(provider)
}

const clearCachedIdentityToken = (token) => {
  return chrome.identity.removeCachedAuthToken({ token }, () => {
    startAuth()
  })
}

const startSignIn = () => {
  const currentUser = firebase.auth().currentUser
  return currentUser ? firebase.auth().signOut() : startAuth()
}

