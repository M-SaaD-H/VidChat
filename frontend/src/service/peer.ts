class PeerService {
  public peer?: RTCPeerConnection

  constructor() {
    if(typeof window === 'undefined') {
      console.warn('RTCPeerConnection is not awailable in SSR');
      return;
    }

    if(!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:global.stun.twilio.com:3478'
            ]
          },
          {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          }
        ]
      })
    }
  }

  async getOffer () {
    if(!this.peer) return;

    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));

    return offer;
  }

  async getAnswer (offer: RTCSessionDescriptionInit) {
    if(!this.peer) return;

    await this.peer.setRemoteDescription(offer);
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));

    return answer;
  }

  async setLocalDescription (answer: RTCSessionDescriptionInit) {
    if(!this.peer) return;

    await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  }
}

export default PeerService