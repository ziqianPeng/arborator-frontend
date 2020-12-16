<template>
  <div ref="playbar" class="player-container">
    <av-waveform
      class="col-grow"
      ref="player"
      :audio-controls="true"
      :canv-top="true"
      :cors-anonym="true"
      :canv-height="50"
      :canv-width="waveWidth"
      :playtime-line-color="progcolor"
      playtime-text-bottom
      :progress-color="progcolor"
      :playtime-slider-color="progcolor"
      :playtime-line-width="5.8"
      :playtime-font-size="14"
      :playtime-slider-width="1"
      :audio-src="mediaObject"
    >
    </av-waveform>
    <div class="row q-pa-none" dense>
      <span
        class="justify-end q-pa-none align-right"
        v-for="(t, i) in sentence"
        :key="i"
      >
        <q-chip
          v-if="t[2] / 1000 < ct"
          size="md"
          color="white"
          text-color="black"
          clickable
          dense
          @click="handleWordClicked(t)"
          class="q-pa-none"
        >
          {{ t[0] }}
        </q-chip>
        <q-chip
          v-else-if="t[1] / 1000 <= ct && t[2] / 1000 >= ct"
          square
          size="md"
          clickable
          dense
          @click="handleWordClicked(t)"
          class="q-pa-none current"
        >
          {{ t[0] }}
        </q-chip>
        <q-chip
          v-else
          size="md"
          color="white"
          text-color="primary"
          clickable
          dense
          @click="handleWordClicked(t)"
          class="q-pa-none"
        >
          {{ t[0] }}
        </q-chip>
      </span>
      <q-btn 
        dense
        round 
        icon="replay" 
        color="primary"
        @click="handlePlaySentence()"
        class="line-play"
        size="sm"
        :disable="!canPlaySentence"
      >
        <q-tooltip>
          Click to play the sentence
        </q-tooltip>
      </q-btn>
      <q-space />
    </div>
  </div>
</template>
<style>

.player-container {
  padding-bottom: 8px;
}

.align-right {
  text-align: right;
}

</style>
<script>
import Vue from "vue";
import AudioVisual from "vue-audio-visual";

Vue.use(AudioVisual);

export default {
  props: ["url", "sentence"],

  data() {
    return {
      audioPlayer: null,
      progcolor: "black",
      currentTime: -1,
      mediaObject: null,
      waveWidth: 700,
      startMS: 0,
      endMS: 0,
      canPlaySentence: true,
    };
  },
  
  created() {
    const index = this.url.lastIndexOf("/");
    this.mediaObject = "/media/" + this.url.slice(index + 1);
    this.waveWidth = window.innerWidth - 100;
  },
  
  computed: {
    ct() {
      return this.currentTime;
    },
  },
  
  mounted() {
    const length = this.sentence.length;

    this.startMS = this.sentence[0][1] / 1000;
    this.endMS = this.sentence[length - 1][2] / 1000;
    if(this.$refs.player) {
      this.audioPlayer = this.$refs.player.audio;
      this.audioPlayer.ontimeupdate = () => this.onTimeUpdate();
      this.audioPlayer.onerror = (error) => this.canPlaySentence = false;
    } else {
      this.canPlaySentence = false;
    }
  },

  methods: {
    onTimeUpdate() {
      if(this.audioPlayer.currentTime > this.endMS
        || this.audioPlayer.currentTime < this.startMS)
        this.audioPlayer.currentTime = this.startMS;
      this.currentTime = this.audioPlayer.currentTime;
    },

    handlePlaySentence() {
      this.audioPlayer.currentTime = this.startMS;
      this.audioPlayer.play();
    },

    handleWordClicked(word) {
      this.audioPlayer.currentTime = word[1] / 1000;
      this.audioPlayer.play();
    }
  }
};
</script>