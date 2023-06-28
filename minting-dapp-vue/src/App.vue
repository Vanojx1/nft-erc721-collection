<template>
  <router-view/>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { useWeb3 } from '@/store/Web3'
import './styles/main.scss'

export default class HomeView extends Vue {
  Web3 = useWeb3()

  mounted () {
    this.Web3.init()
  }
}
</script>

<style>
</style>
