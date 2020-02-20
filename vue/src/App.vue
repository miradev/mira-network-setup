<template>
  <div id="app">
    <div class="container">
      <img id="logo" alt="Vue logo" src="./assets/logo.png" />
      <p class="is-size-4">Connect to a network.</p>
      <br />
      <button class="button is-primary" v-on:click="scanNetworks()">Scan Networks</button>
      <nav v-if="ssids.length > 0" class="panel">
        <p class="panel-heading">
          List of Networks
        </p>
        <div class="panel-wrapper" v-for="ssid in ssids" v-bind:key="ssid">
          <a class="panel-block" v-on:click="selectNetwork">
            {{ ssid }}
          </a>
        </div>
      </nav>
      <div id="selected" v-if="selectedSSID.length > 0" class="field">
        <label class="label">Network: {{ selectedSSID }}</label>
        <div class="control">
          <input v-model="ssidPassword" class="input" type="password" placeholder="SSID password" />
          <button class="button is-primary" v-on:click="connectToNetwork()">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import axios from "axios"

@Component
export default class App extends Vue {
  private ssids: string[] = []
  private selectedSSID = ""
  private ssidPassword = ""

  public scanNetworks() {
    axios.get("localhost:3000/scan").then(value => {
      const networks = value.data
      this.ssids = networks
    })
  }

  public selectNetwork(event: MouseEvent) {
    this.selectedSSID = (event.target as HTMLAnchorElement).text.trim()
  }

  public connectToNetwork() {
    const ssid = this.selectedSSID
    const password = this.ssidPassword
    axios
      .post("localhost:3000/connect", {
        ssid: ssid,
        password: password,
      })
      .then(value => {
        console.log(value)
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
</style>
