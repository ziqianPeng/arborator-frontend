<template>
  <q-dialog v-model="dialogOpened">
    <q-card style="height: 90vh; width: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Multi edit</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <table v-if="treeJson">
        <tr>
          <th>ID</th>
          <th>TOKEN</th>
          <th v-for="metaLabel in metaLabels" :key="metaLabel">
            {{ metaLabel }}
          </th>
        </tr>
        <tr>
          <th>0</th>
          <th>All :</th>
          <td v-for="metaLabel in metaLabels" :key="metaLabel">
            <input type="checkbox" :name="metaLabel" :checked="checkboxesAll[metaLabel]" @input="toggleAll(metaLabel)" />
          </td>
        </tr>
        <tr>
          <td colspan="2" class="divider"><hr /></td>
        </tr>
        <tr v-for="token of treeJson" :key="token.ID">
          <th>{{ token.ID }}</th>
          <th>{{ token.FORM }}</th>
          <td v-for="metaLabel in metaLabels" :key="metaLabel">
            <input v-model="checkboxes[token.ID][metaLabel]" type="checkbox" :name="metaLabel" :class="metaLabel" />
          </td>
        </tr>
      </table>

      <q-separator />
      <q-card-actions align="around">
        <!-- @click="ondialoghide()" -->
        <q-btn v-close-popup flat label="Cancel" style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn v-close-popup color="primary" label="Ok" style="width: 45%; margin-left: auto; margin-right: auto" @click="onDialogOk()" />
        <!-- :disabled="!someFeatureChanged" -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { TokenJson } from 'conllup/lib/conll';
import conllup from 'conllup';
const emptyTreeJson = conllup.emptyTreeJson;

type metaLabel_t = 'UPOS' | 'DEPREL' | 'HEAD' | 'LEMMA';

import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
  },
  data() {
    const treeJson = emptyTreeJson();
    const metaLabels: metaLabel_t[] = ['UPOS', 'DEPREL', 'HEAD', 'LEMMA'];
    const checkboxes: { [key: string]: { [key in metaLabel_t]: boolean } } = {};
    return {
      dialogOpened: false,
      userId: '',
      treeJson,
      checkboxes,
      metaLabels,
      checkboxesAll: { UPOS: false, DEPREL: false, HEAD: false, LEMMA: false },
    };
  },
  mounted() {
    this.sentenceBus.on('open:openMultiEditDialog', ({ userId }) => {
      this.userId = userId;
      this.treeJson = JSON.parse(JSON.stringify(this.sentenceBus.sentenceSVGs[this.userId].treeJson));
      for (const metaLabel of this.metaLabels) {
        this.checkboxesAll[metaLabel] = false;
      }
      for (const token in this.treeJson) {
        const checkboxesToken: { [key in metaLabel_t]: boolean } = { UPOS: false, DEPREL: false, HEAD: false, LEMMA: false };
        // checkboxesToken["UPOS"] = false;
        // checkboxesToken["DEPREL"] = false;
        // checkboxesToken["HEAD"] = false;
        this.checkboxes[token] = checkboxesToken;
      }
      this.dialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:openMultiEditDialog');
  },
  methods: {
    onDialogOk() {
      for (const token in this.treeJson) {
        for (const metaLabel of this.metaLabels) {
          const toDeleteBool = this.checkboxes[token][metaLabel];
          if (toDeleteBool) {
            this.treeJson[token][metaLabel as keyof TokenJson] = '_';
            if (metaLabel === 'HEAD') {
              this.treeJson[token].DEPREL = '_';
            }
          }
        }
      }
      this.sentenceBus.emit('tree-update:tree', {
        tree: this.treeJson,
        userId: this.userId,
      });
      this.uncheckToggles();
    },
    toggleAll(metaLabel: metaLabel_t) {
      this.checkboxesAll[metaLabel] = !this.checkboxesAll[metaLabel];
      for (const token in this.treeJson) {
        this.checkboxes[token][metaLabel] = this.checkboxesAll[metaLabel];
      }
    },
    uncheckToggles() {
      for (const metaLabel of this.metaLabels) {
        this.checkboxesAll[metaLabel] = false;
      }
    },
  },
});
</script>
<style></style>
