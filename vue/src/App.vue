<template>
  <div id="app">
    <div class="container">
      <img id="logo" alt="Vue logo" src="./assets/logo.png" />
      <p class="is-size-4">Connect to a network.</p>
      <br />
      <button v-show="canScan" class="button is-primary" v-on:click="scanNetworks()">Scan Networks</button>
      <p v-if="scanning" class="is-size-4 loading msg">Scanning</p>
      <nav v-if="ssids.length > 0" class="panel">
        <p class="panel-heading">
          List of Networks
        </p>
        <div class="panel-wrapper" v-for="id in ssids" v-bind:key="id">
          <a class="panel-block" v-on:click="selectNetwork">
            {{ id }}
          </a>
        </div>
      </nav>
      <div id="selected" v-if="ssid.length > 0" class="field">
        <label class="label">Network: {{ ssid }}</label>
        <div class="control">
          <input v-model="ssidPassword" class="input" type="password" placeholder="SSID password" />
          <button class="button is-primary" v-on:click="connectToNetwork()">Connect</button>
        </div>
      </div>
      <p v-if="connecting" class="is-size-4 loading msg">Connecting</p>
      <p v-show="status" class="is-size-4 msg">{{ status }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import axios from "axios"

const axiosConfig = {
  timeout: 1000 * 45,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
  },
}

@Component
export default class App extends Vue {
  private ssids: string[] = []
  private ssid = ""
  private ssidPassword = ""
  private canScan = false
  private scanning = false
  private connecting = false
  private status = ""
  private host!: string

  mounted() {
    this.host = `${window.location.protocol}//${window.location.host}`
    this.status = "Testing connectivity..."
    axios
      .get(this.api("/ping"))
      .then(value => {
        this.status = `You are connected to ${value.data.ssid} with internet access!`
      })
      .catch(err => {
        this.canScan = true
        this.status = `You are not connected to an internet enabled network.`
      })
  }

  private api(endpoint: string): string {
    return this.host + endpoint
  }

  public scanNetworks() {
    this.scanning = true
    this.status = ""
    axios
      .get(this.api("/scan"))
      .then(value => {
        const networks = value.data
        this.ssids = networks
        this.scanning = false
      })
      .catch(() => {
        this.scanning = false
      })
  }

  public selectNetwork(event: MouseEvent) {
    this.ssid = (event.target as HTMLAnchorElement).text.trim()
  }

  public connectToNetwork() {
    this.connecting = true
    const ssid = this.ssid
    const password = this.ssidPassword
    axios
      .post(
        this.api("/connect"),
        {
          ssid: ssid,
          password: password,
        },
        axiosConfig,
      )
      .then(() => {
        this.connecting = false
      })
      .catch(() => {
        this.connecting = false
      })
      .then(() => {
        this.status = "Testing connectivity on new network. If your device disconnects from MiraNet, please reconnect to it and refresh the page."
        setTimeout(() => {
          // Refresh page
          window.location.reload()
        }, 10000)
      })
  }
}
</script>

<style lang="sass">
$background: #2B2E3B
$highlight: #AFEDFA
$primary: lighten($background, 25%)
@import "~bulma/bulma"

html, body
  height: 100%
  background: $background

#logo
  width: 12rem
  height: 12rem

label.label
  color: $highlight

.panel
  margin: 2rem
  color: $highlight
  border: 1px solid darken($highlight, 10%)

.panel-heading, .panel-block
  color: $highlight
  background: $background

// button.button
//   color: lighten($highlight, 10%)
//   background: darken(#4F6E79, 10%)
//   border: 1px solid darken($highlight, 10%)
//   &:hover
//     border-color: darken($highlight, 10%)
//   &:active
//     border-color: white
//   &:focus
//     border-color: darken($highlight, 40%)
//   &:hover, &:active, &:focus
//     color: lighten($highlight, 10%)
//     background: #4F6E79

a.panel-block
  &:hover
    color: lighten($highlight, 10%)
    background: lighten($background, 15%)

#selected
  margin: 2rem
  input, button
    margin-top: 0.5rem
    margin-bottom: 0.5rem
  .control
    display: flex
    align-items: center
    justify-content: center
    flex-wrap: wrap
    input
      flex-shrink: 0
      width: 100%

div.container
  max-width: 600px

#app
  font-family: sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: $highlight

.msg
  margin: 2rem

.loading:after
  overflow: hidden
  display: inline-block
  vertical-align: bottom
  -webkit-animation: ellipsis steps(4,end) 900ms infinite
  animation: ellipsis steps(4,end) 900ms infinite
  content: "\2026"
  width: 0px

@keyframes ellipsis
  to
    width: 1.25em

@-webkit-keyframes ellipsis
  to
    width: 1.25em
</style>
