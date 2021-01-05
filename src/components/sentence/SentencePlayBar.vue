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
      :audio-src="remoteUrl"
      :audio-src-local="localUrl"
      :begin="startMS"
      :end="endMS"
    >
    </av-waveform>
    <div class="row q-pa-md" dense>
      <q-btn
        class="q-mr-xs"
        color="primary"
        icon="skip_previous"
        size="sm"
        @click="handlePlayPrev()"
        round
      >
        <q-tooltip>
          Play the previous sentence
        </q-tooltip>
      </q-btn>
      <q-btn
        class="q-mr-xs"
        color="primary"
        size="sm"
        icon="not_started"
        @click="handlePlaySentence()"
        :disable="!canPlay"
        round
      >
        <q-tooltip>
          Play / pause the sentence
        </q-tooltip>
      </q-btn>
      <q-btn
        class="q-mr-xs"
        color="primary"
        size="sm"
        icon="skip_next"
        @click="handlePlayNext()"
        round
      >
        <q-tooltip>
          Play the next sentence
        </q-tooltip>
      </q-btn>
       <q-toggle
        v-model="replay"
        label="Replay"
        size="xs"
      />
    </div>
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
import AvWaveform from 'src/components/vue-audio-visual/AvWaveForm';


export default {
  props: ["url", "sentence"],
  components: { AvWaveform },
  data() {
    return {
      audioPlayer: null,
      progcolor: "black",
      currentTime: -1,
      localUrl: null,
      remoteUrl: null,
      waveWidth: 700,
      startMS: 0,
      endMS: 0,
      replay: false,
      canPlay: false
    };
  },
  
  created() {
    const index = this.url.lastIndexOf("/");
    this.remoteUrl = this.url;
    this.localUrl = "/media/" + this.url.slice(index + 1);
    this.waveWidth = window.innerWidth - 100;

    // If url is http, not https then search for audio on the server
    if (this.url.includes('http://')){ 
      this.remoteUrl = this.localUrl
    }
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
      this.audioPlayer.currentTime = this.startMS;
      this.audioPlayer.ontimeupdate = () => this.onTimeUpdate();
      this.audioPlayer.onloadeddata = (evt) => this.canPlay = true;
    }
  },

  methods: {
    onTimeUpdate() {
      if(
        this.audioPlayer.currentTime > this.endMS || 
        this.audioPlayer.currentTime < this.startMS
      ) {
        this.audioPlayer.currentTime = this.startMS + 0.001;
        if (this.isPlaying() && !this.replay) {
          this.audioPlayer.pause();
        }
      }

      this.currentTime = this.audioPlayer.currentTime;
    },

    isPlaying() {
      if (this.audioPlayer) {
        return !this.audioPlayer.paused;
      } else {
        return false;
      }
    },

    handlePlaySentence() {
      if (!this.canPlay) {
        return;
      }
      if (!this.audioPlayer.paused) {
        this.audioPlayer.pause();
      } else {
        this.audioPlayer.play();
      }
    },

    handlePlayPrev() {
      this.audioPlayer.pause();
      this.$emit('goToPrev');
    },

    handlePlayNext() {
      this.audioPlayer.pause();
      this.$emit('goToNext');
    },

    handleWordClicked(word) {
      this.audioPlayer.currentTime = word[1] / 1000;
      this.audioPlayer.play();
    },

  },

};
</script>