<template>
  <q-card>
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">{{ $t('confirmAction.title') }}</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section> {{ $t('confirmAction.message') }}</q-card-section>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-card-section>
      
        <q-input filled v-model="name" label="Your project name*" hint="Type the project name" lazy-rules 
        :rules="[ 
          val => val && val.length > 0 || 'Please type something',
          val => val == $props.targetName || 'The project name does not correspond'
        ]"
        />
      </q-card-section>
      <q-card-actions align="around" >
        <q-btn v-close-popup flat label="Cancel"></q-btn>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        <q-btn v-if="$props.targetName!=null" label="Confirm" type="submit" color="primary" @keyup.enter="confirm()" @click="confirm()"/>
        <q-btn v-else v-close-popup color="primary" label="Confirm" @keyup.enter="confirm()" @click="confirm()"></q-btn>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
export default defineComponent({
  name: 'ConfirmAction',
  props: {
    parentAction: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    arg1: {
      type: String as PropType<string>,
      required: true,
    },
    targetName: {
      type: String as PropType<string>,
      required: false,
    }
  },
  data() {
    return {
      name: ''
    };
  },
  methods: {
    /**
     * Trigger a parentAction to handle confirm dialog
     *
     * @returns void
     */
    confirm() {
      if (this.$props.targetName != null) {
        if (this.$props.targetName == this.name) this.parentAction(this.arg1, this.name);
      }else{ this.parentAction(this.arg1); }
    },
  },
});
</script>
