<template>
  <q-page id="container" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div class="q-pa-md row q-gutter-md flex flex-center">
      <q-card flat style="max-width: 100%">
        <q-card-section class="project-header">
          <q-toolbar class="text-center">
            <!-- <q-toolbar-title><span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">{.name}}</span> </q-toolbar-title> -->
          </q-toolbar>
          <q-img class="project-image" :src="cleanedImage" basic>
            <div class="absolute-bottom text-h6" style="padding: 6px">
              <q-icon v-show="visibility === 0" name="lock" :color="$q.dark.isActive ? 'red-13' : 'negative'" size="lg"></q-icon>
              <q-icon v-show="visibility === 1" name="lock" :color="$q.dark.isActive ? 'red-13' : 'positive'" size="lg"></q-icon>
              <q-icon v-show="visibility === 2" name="public" :color="$q.dark.isActive ? 'red-13' : 'positive'" size="lg"></q-icon>
              Project {{ $route.params.projectname }}
              <q-btn
                v-if="isSuperAdmin || isAdmin"
                flat
                round
                :color="$q.dark.isActive ? 'primary' : ''"
                icon="settings"
                @click="projectSettingsDial = true"
              >
                <!-- <q-btn v-if="1" flat round :color="$q.dark.isActive?'primary':''" icon="settings" @click="projectSettingsDial=true"> -->
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSettings') }}</q-tooltip>
              </q-btn>
              <q-btn v-else flat round :color="$q.dark.isActive ? 'primary' : ''" icon="settings" @click="simpleProjectInfoDialog = true">
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipViewAdmin') }}</q-tooltip>
              </q-btn>
            </div>
          </q-img>
          <div class="text-primary">{{ description }}</div>
        </q-card-section>
        <q-card-section v-if="isShowLexiconPanel">
          <LexiconPanel :lexicon-items="lexiconItems" :sample-id="table.selected" @request="fetchLexicon_"> </LexiconPanel>
        </q-card-section>
        <q-card-section>
          <q-table
            ref="textsTable"
            :key="tableKey"
            v-model:pagination="table.pagination"
            v-model:selected="table.selected"
            :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
            title="Samples"
            :rows="samples"
            :columns="table.fields"
            row-key="sample_name"
            :loading="table.loading"
            loading-label="loading"
            :filter="table.filter"
            :filter-method="searchSamples"
            binary-state-sort
            :visible-columns="exerciseMode ? table.visibleColumnsExerciseMode : table.visibleColumns"
            selection="multiple"
            :table-header-class="$q.dark.isActive ? 'text-white' : 'text-primary'"
            card-class="shadow-8"
            virtual-scroll
            table-style="max-height:80vh"
            :rows-per-page-options="[30]"
          >
            <!-- @request="getProjectInfos" -->
            <template #top="props">
              <q-btn-group flat>
                <q-btn v-if="isAdmin || isSuperAdmin" flat color="default" icon="cloud_upload" @click="uploadDial = true">
                  <q-tooltip v-if="isSuperAdmin || isAdmin" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipAddSample')
                  }}</q-tooltip>
                </q-btn>

                <div>
                  <q-btn
                    flat
                    color="default"
                    icon="cloud_download"
                    :loading="table.exporting"
                    :disable="(visibility === 0 && !isGuest && !isAdmin && !isSuperAdmin) || table.selected.length < 1"
                    @click="exportSamplesZip()"
                  ></q-btn>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipExportSample[0]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportSample[1]') }}</q-tooltip>
                </div>

                <div>
                  <q-btn
                    v-if="isTeacher"
                    flat
                    color="default"
                    icon="analytics"
                    :loading="table.exporting"
                    :disable="(visibility === 0 && !isGuest && !isAdmin && !isSuperAdmin) || table.selected.length !== 1"
                    @click="exportEvaluation()"
                  ></q-btn>
                  <q-tooltip content-class="text-white bg-primary"
                    >export evaluations of the students (only works if only one sample is selected)
                  </q-tooltip>
                </div>

                <q-btn v-if="isAdmin || isSuperAdmin" v-show="table.selected.length < 1" flat color="default" icon="delete_forever" disable>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipDeleteSample[0]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipDeleteSample[1]') }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="isAdmin || isSuperAdmin"
                  v-show="table.selected.length !== 0"
                  :loading="table.loadingDelete"
                  flat
                  color="default"
                  text-color="red"
                  icon="delete_forever"
                  :disable="!isAdmin && !isSuperAdmin"
                  @click="triggerConfirm(deleteSamples)"
                >
                  <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipDeleteSample[1]') }}</q-tooltip>
                </q-btn>

                <!-- ion-logo-github -->
                <div>
                  <q-btn-dropdown v-if="loggedWithGithub" :disable="table.selected.length < 1" icon="ion-md-git-commit" flat dense>
                    <q-list>
                      <q-item v-close-popup clickable @click="commit('user')">
                        <q-item-section avatar>
                          <q-avatar v-if="isLoggedIn" size="1.2rem">
                            <img :src="avatar" />
                          </q-avatar>
                          <q-icon v-else name="account_circle" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.tooltipGitPush[0]') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-close-popup clickable @click="commit('user_recent')">
                        <q-item-section avatar>
                          <q-avatar v-if="isLoggedIn" size="1.2rem">
                            <img :src="avatar" />
                            <q-badge floating transparent color="principal">+</q-badge>
                          </q-avatar>
                          <q-icon v-else name="account_circle" />
                          <div></div>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.tooltipGitPush[1]') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable @click="commit('recent')">
                        <q-item-section avatar>
                          <q-icon name="schedule" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.tooltipGitPush[2]') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable @click="commit('all')">
                        <q-item-section avatar>
                          <q-icon name="ion-md-globe" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.tooltipGitPush[3]') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <!-- v-if="loggedWithGithub" :disable="table.selected.length<1 -->

                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipGitPush[4]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipGitPush[5]') }}</q-tooltip>
                </div>

                <div>
                  <q-btn-dropdown v-if="loggedWithGithub" :disable="false" icon="ion-md-git-pull-request" flat dense>
                    <q-list>
                      <q-item v-close-popup clickable :disable="table.selected.length < 1" @click="pull('user')">
                        <q-item-section avatar>
                          <q-avatar v-if="isLoggedIn" size="1.2rem">
                            <img :src="avatar" />
                          </q-avatar>
                          <q-icon v-else name="account_circle" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.gitPullUser') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="isAdmin || isSuperAdmin" v-close-popup clickable :disable="table.selected.length < 1" @click="pull('all')">
                        <q-item-section avatar>
                          <q-icon name="ion-md-globe" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('projectView.gitPullAll') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipGitPullSelect[0]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipGitPullSelect[1]') }}</q-tooltip>
                  <q-tooltip :delay="300" content-class="text-white bg-primary"></q-tooltip>
                </div>

                <div v-if="isGuest || isAdmin || isSuperAdmin">
                  <q-btn
                    v-show="isShowLexiconPanel === false"
                    flat
                    color="default"
                    icon="playlist_add_check"
                    :loading="table.exporting"
                    :disable="table.selected.length < 1"
                    @click="fetchLexicon_('test')"
                  ></q-btn>
                  <q-btn
                    v-if="isGuest || isAdmin || isSuperAdmin"
                    v-show="isShowLexiconPanel === true"
                    flat
                    color="default"
                    icon="playlist_add_check"
                    :loading="table.exporting"
                    :disable="table.selected.length < 1"
                    @click="isShowLexiconPanel = false"
                  ></q-btn>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary"
                    >Select the samples to create a lexicon</q-tooltip
                  >
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">Create lexicon from selected samples</q-tooltip>
                </div>
              </q-btn-group>

              <q-space />

              <q-input v-model="table.filter" dense debounce="300" placeholder="Search" text-color="blue-grey-8">
                <template #append>
                  <q-icon name="search" />
                </template>
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSearch') }}</q-tooltip>
              </q-input>

              <q-space />

              <q-select
                v-model="table.visibleColumns"
                multiple
                borderless
                dense
                options-dense
                :display-value="$q.lang.table.columns"
                emit-value
                map-options
                :options="filterFields(table)"
                option-value="name"
                style="min-width: 100px"
              >
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSelectVisible') }}</q-tooltip>
              </q-select>

              <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" class="q-ml-md" @click="props.toggleFullscreen">
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipFullscreen') }}</q-tooltip>
              </q-btn>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-toggle v-model="props.selected" dense />
                </q-td>
                <q-td key="samplename" :props="props">
                  <q-btn
                    :disable="props.row.sentences === 0"
                    outline
                    color="white"
                    :text-color="$q.dark.isActive ? 'white' : 'black'"
                    class="full-width"
                    :to="'/projects/' + $route.params.projectname + '/' + props.row.sample_name"
                    icon-right="open_in_browser"
                    no-caps
                    >{{ props.row.sample_name }}</q-btn
                  >
                </q-td>
                <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
                <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
                <q-td key="annotators" :props="props">
                  <TagInput
                    v-if="isAdmin || isSuperAdmin"
                    v-model="props.row.roles.annotator"
                    role="annotator"
                    :tag-context="props.row"
                    :element-id="props.row.sample_name + 'annotatortag'"
                    :existing-tags="possiblesUsers"
                    :typeahead="true"
                    typeahead-style="badges"
                    :typeahead-hide-discard="true"
                    placeholder="add user"
                    :only-existing-tags="true"
                    :typeahead-always-show="false"
                    @tag-added="modifyRole"
                    @tag-removed="modifyRole"
                  ></TagInput>
                  <q-list v-else dense>
                    <q-item v-for="source in props.row.roles.annotator" :key="source" :props="source">
                      <q-item-label caption>{{ source.value }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="validators" :props="props">
                  <TagInput
                    v-if="isAdmin || isSuperAdmin"
                    v-model="props.row.roles.validator"
                    role="validator"
                    :tag-context="props.row"
                    :element-id="props.row.sample_name + 'validatortag'"
                    :existing-tags="possiblesUsers"
                    :typeahead="true"
                    typeahead-style="badges"
                    :typeahead-hide-discard="true"
                    placeholder="add user"
                    :only-existing-tags="true"
                    :typeahead-always-show="false"
                    @tag-added="modifyRole"
                    @tag-removed="modifyRole"
                  ></TagInput>
                  <q-list v-else dense>
                    <q-item v-for="source in props.row.roles.validator" :key="source" :props="source">
                      <q-item-label caption>{{ source.value }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="treesFrom" :props="props">
                  <q-item-label v-if="props.row.treesFrom.length >= 5" caption>
                    {{ props.row.treesFrom.length }} users
                    <q-tooltip>
                      <p v-for="userId in props.row.treesFrom" :key="userId" :props="userId">
                        {{ userId }}
                      </p>
                    </q-tooltip>
                  </q-item-label>
                  <q-list v-else dense>
                    <q-item v-for="userId in props.row.treesFrom" :key="userId" :props="userId">
                      <q-item-label caption>{{ userId }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="exerciseLevel" :props="props">
                  <q-select
                    v-model="props.row.exerciseLevel"
                    outlined
                    :options="exerciceModeOptions"
                    map-options
                    emit-value
                    label="exercise level"
                    :dense="false"
                    :disable="!isAdmin"
                    @update:model-value="updateExerciseLevel(props.row)"
                  />
                </q-td>
                <!-- <q-td key="exo" :props="props">{{ props.row.exo }}</q-td> -->
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <template v-if="!exerciseMode && !isTeacher">
        <GrewSearch :sentence-count="0" />
        <RelationTableMain />
      </template>
      <!-- :sentenceCount=.number_sentences" -->

      <!-- upload dialog start -->
      <q-dialog v-model="assignDial" persistent transition-show="slide-up" transition-hide="slide-down">
        <user-table :samples="table.selected"></user-table>
      </q-dialog>
      <UploadDialog v-model:uploadDial="uploadDial" @uploaded:sample="getProjectSamples()" />

      <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down">
        <ProjectSettingsView
          :project-trees-from="projectTreesFrom"
          :projectname="$route.params.projectname"
          style="width: 90vw"
        ></ProjectSettingsView>
      </q-dialog>

      <q-dialog v-model="simpleProjectInfoDialog">
        <q-card style="width: 300px">
          <q-card-section>
            <div class="text-h6">
              {{ $t('projectView.projectInfoDial.title') }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="admins.length > 1">
              {{ $t('projectView.projectInfoDial.ifAdmin') }}
            </div>
            <div v-else>{{ $t('projectView.projectInfoDial.else') }}</div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item v-for="admin in admins" :key="admin">
                <q-item-label caption>{{ admin }}</q-item-label>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn v-close-popup flat label="OK" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="confirmActionDial">
        <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action>
      </q-dialog>
    </div>
  </q-page>
</template>

<script lang="ts">
import api from '../api/backend-api';

import UserTable from '../components/UserTable.vue';
import TagInput from '../components/TagInput.vue';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction.vue';
import UploadDialog from '../components/project/UploadDialog.vue';
import LexiconPanel from '../components/lexicon/LexiconPanel.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import { notifyError } from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { sample_roles_t, sample_t, user_sample_roles_t, sample_role_targetrole_t, sample_role_action_t } from 'src/api/backend-types';
import { defineComponent } from 'vue';
import { table_t } from 'src/types/main_types';

interface alert_t {
  color?: string;
  textColor?: string;
  multiLine?: boolean;
  icon?: string;
  message?: string;
  avatar?: string;
  actions?: any[];
}

export default defineComponent({
  components: {
    UserTable,
    TagInput,
    ProjectSettingsView,
    ConfirmAction,
    UploadDialog,
    LexiconPanel,
    GrewSearch,
    RelationTableMain,
  },
  data() {
    const samples: sample_t[] = [];
    const selected: sample_t[] = [];
    const projectTreesFrom: string[] = [];
    const possiblesUsers: user_sample_roles_t[] = [];
    const confirmActionCallback: CallableFunction = () => {
      console.log('Callback not init yet');
    };
    const alerts: { [key: string]: alert_t } = {
      uploadsuccess: { color: 'positive', message: 'Upload success' },
      uploadfail: {
        color: 'negative',
        message: 'Upload failed',
        icon: 'report_problem',
      },
      deletesuccess: { color: 'positive', message: 'Delete success' },
      deletefail: {
        color: 'negative',
        message: 'Delete failed',
        icon: 'report_problem',
      },
      GitHubPushSuccess: {
        color: 'positive',
        message: 'Successfully pushed your data to GitHub',
      },
    };

    const table: table_t<sample_t> = {
      fields: [
        {
          name: 'samplename',
          label: 'Name',
          sortable: true,
          field: 'samplename',
        },
        {
          name: 'sentences',
          label: 'Nb Sentences',
          sortable: true,
          field: 'sentences',
        },
        {
          name: 'tokens',
          label: 'Nb Tokens',
          sortable: true,
          field: 'number_tokens',
        },
        {
          name: 'annotators',
          label: 'Annotators',
          sortable: true,
          field: 'roles.annotator',
        },
        {
          name: 'validators',
          label: 'Validators',
          sortable: true,
          field: 'roles.validator',
        },
        {
          name: 'profs',
          label: 'Profs',
          sortable: true,
          field: 'roles.prof',
        },
        {
          name: 'treesFrom',
          label: 'Trees From',
          sortable: true,
          field: 'treesFrom',
        },
        {
          name: 'exerciseLevel',
          label: 'Exercise Level',
          sortable: true,
          field: 'exerciseLevel',
        },
      ],
      selected,
      visibleColumns: ['samplename', 'annotators', 'validators', 'treesFrom', 'tokens', 'sentences'],
      visibleColumnsExerciseMode: ['samplename', 'exerciseLevel', 'treesFrom', 'tokens', 'sentences'],
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'samplename',
        descending: true,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      table,
      tab: 'texts',
      btnTopClass: this.$q.dark.isActive ? 'white' : 'blue-grey-8',
      assignDial: false,
      uploadDial: false,
      projectSettingsDial: false,
      simpleProjectInfoDialog: false,
      confirmActionDial: false,
      confirmActionCallback,
      confirmActionArg1: '',
      lexiconItems: [],
      alerts,
      project: {
        // todo: this seems to be useless
        infos: {
          name: '',
          visibility: 2,
          is_open: false,
          description: '',
          image: '',
          admins: [],
          guests: [],
        },
        samples: [],
      },
      samples,
      projectTreesFrom,

      exerciceModeOptions: [
        {
          label: '1: teacher_visible',
          value: 1,
        },
        {
          label: '2: local_feedback',
          value: 2,
        },
        {
          label: '3: global_feedback',
          value: 3,
        },
        {
          label: '4: no_feedback',
          value: 4,
        },
      ],
      window: { width: 0, height: 0 },
      possiblesUsers,
      tagContext: {},
      tableKey: 0,
      initLoad: false,
      isShowLexiconPanel: false,
    };
  },
  computed: {
    ...mapState(useProjectStore, [
      'visibility',
      'isAdmin',
      'isGuest',
      'guests',
      'admins',
      'image',
      'exerciseMode',
      'cleanedImage',
      'description',
      'isTeacher',
    ]),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'loggedWithGithub', 'avatar']),

    routePath() {
      return this.$route.path;
    },
    noselect(): boolean {
      return this.table.selected.length < 1;
    },
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    this.getUsers();
    this.getProjectSamples();
    document.title = `ArboratorGrew: ${this.$route.params.projectname}`;
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    ...mapActions(useLexiconStore, ['fetchLexicon']),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },

    goToRoute() {
      this.$router.push(`/projects/${this.$route.params.projectname}/samples`);
    },

    filterFields(tableJson: table_t<unknown>) {
      // to remove some fields from visiblecolumns select options
      const tempArray = tableJson.fields.filter((obj) => obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions');
      return tempArray;
    },
    getProjectSamples() {
      api.getProjectSamples(this.$route.params.projectname as string).then((response) => {
        this.samples = response.data;
        this.projectTreesFrom = this.getProjectTreesFrom();
      });
    },
    getProjectTreesFrom() {
      const projectTreesFrom: string[] = [];

      for (const sample of this.samples) {
        const sampleTreesFrom = sample.treesFrom;

        for (const userId of sampleTreesFrom) {
          if (!projectTreesFrom.includes(userId)) {
            projectTreesFrom.push(userId);
          }
        }
      }
      return projectTreesFrom;
    },
    getUsers() {
      // TODO : change this function as it's downloading all users each time. It should only be users of the project
      // this method populate the `possiblesUsers` list for feeding the annotator and validator tag input choice
      api
        .getUsers()
        .then((response) => {
          for (const name of response.data.map((a) => a.username)) {
            this.possiblesUsers.push({ key: name, value: name });
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    deleteSamples() {
      for (const sample of this.table.selected) {
        api
          .deleteSample(this.$route.params.projectname as string, sample.sample_name)
          .then(() => {
            this.table.selected = [];
            this.showNotif('top-right', 'deletesuccess');
            this.getProjectSamples();
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },

    commit(type: string) {
      console.log('deprecated function push', type);

      // const samplenames = [];
      // for (const sample of this.table.selected) {
      //   samplenames.push(sample.sample_name);
      // }
      // const data = { samplenames, commit_type: type };
      // api
      //   .commit(this.$route.params.projectname, data)
      //   .then((response) => {
      //     console.log(777, response);
      //     this.showNotif('top', 'GitHubPushSuccess');
      //   })
      //   .catch((error) => {
      //     if (error.response.data.status === 418) {
      //       error.response.message = error.response.data.message;
      //       error.permanent = true;
      //       notifyError({ error });
      //     } else if (error.response.data.status === 204) {
      //       notifyError({
      //         error: error.response.data.message,
      //       });
      //     } else notifyError({ error });
      //   });
    },
    pull(type: string) {
      console.log('deprecated function pull', type);
      // const samplenames = [];
      // for (const sample of this.table.selected) {
      //   samplenames.push(sample.sample_name);
      // }
      // const data = { samplenames, pull_type: type };
      // api
      //   .pull(this.$route.params.projectname, data)
      //   .then(() => {
      //     console.log('wooohoo');
      //   })
      //   .catch((error) => {
      //     console.log('ici il faut un popup utile indiquant comment installer l application');

      //     notifyError({ error });
      //   });
    },
    exportSamplesZip() {
      this.table.exporting = true;
      const samplenames = [];
      for (const sample of this.table.selected) {
        samplenames.push(sample.sample_name);
      }
      api
        .exportSamplesZip(samplenames, this.$route.params.projectname as string)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `dump_${this.$route.params.projectname}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          this.$q.notify({ message: 'Files downloaded' });
          return [];
        })
        .catch((error) => {
          this.table.exporting = false;
          // this.$q.notify({message:`${error}`, color:'negative'});
          notifyError({ error });
          return [];
        });
    },
    fetchLexicon_(type: string) {
      const samplenames = [];
      for (const sample of this.table.selected) {
        samplenames.push(sample.sample_name);
      }

      this.fetchLexicon(this.$route.params.projectname as string, samplenames, type);
      this.isShowLexiconPanel = true
    },

    // grewquery() {
    //     console.log('projectview',this.grewqueryc)
    //     if (this.grewqueryc==0) return
    //     this.grewqueryc+= 1;
    //     // if(this.$route.query.q && this.$route.query.q.length>0) this.searchDialog=true;
    // },
    /**
     * Used to update tags and table view based on response
     * @param response : the response from backend
     * @param samplename : the sample name to find
     */
    updateTags(roles: sample_roles_t, samplename: string) {
      for (const [i, sample] of this.samples.entries()) {
        if (sample.sample_name === samplename) {
          this.samples[i].roles = roles;
        }
      }
      this.tableKey += 1;
      // this.$refs.textsTable.requestServerInteraction(this.table.pagination);
    },

    reverseTags(value: string, samplename: string, target: sample_role_targetrole_t) {
      for (const [i, sample] of this.samples.entries()) {
        if (sample.sample_name === samplename) {
          const res = this.samples[i].roles[target].filter((name) => name.key !== value);
          this.samples[i].roles[target] = res;
        }
      }
      this.tableKey += 1;
    },
    /*
    Kirian : New method that add/remove annotator/validator to a sample
    */
    modifyRole(slug: { value: string }, context: sample_t, role: sample_role_targetrole_t, action: sample_role_action_t) {
      api
        .modifySampleRole(this.$route.params.projectname as string, context.sample_name, slug.value, role, action)
        .then((response) => {
          this.updateTags(response.data.roles, context.sample_name);
          this.$q.notify({ message: 'Change saved!' });
        })
        .catch((error) => {
          this.reverseTags(slug.value, context.sample_name, role);
          notifyError({ error });
        });
    },
    updateExerciseLevel(sample: sample_t) {
      setTimeout(() => {
        // IMPORTANT : Since quasar v2 (vue v3), the update method (in q-select) occurs BEFORE the value is updated
        // So we need to use this hack of setTimeout if we want to access to the updated sample.exerciseLevel
        api.updateSampleExerciseLevel(this.$route.params.projectname as string, sample.sample_name, sample.exerciseLevel);
      }, 0);
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },

    showNotif(position: any, alert: string) {
      const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
      this.$q.notify({
        color,
        textColor,
        icon,
        message,
        position,
        avatar,
        multiLine,
        actions,
        timeout: 2000,
      });
    },

    searchSamples(rows: sample_t[], terms: any) {
      return rows.filter((row) => row.sample_name.indexOf(terms) !== -1);
    },

    exportEvaluation() {
      const projectName = this.$route.params.projectname as string;
      const sampleName = this.table.selected[0].sample_name;
      const fileName = `${sampleName}_evaluations`;
      api
        .exportEvaluation(projectName, sampleName)
        .then((response) => {
          this.downloadFileAttachement(response.data, fileName);
        })
        .catch((error) => {
          notifyError({ error });
        });
      // window.open(`/api/projects/${projectName}/samples/${sampleName}/evaluation`);
      // api.exportEvaluation(projectName, sampleName).then((response) => {
      //   this.downloadFileAttachement(response.data, fileName)
      //   // var evaluations = response.data;
      //   // var data =
      //   //   "text/json;charset=utf-8," +
      //   //   encodeURIComponent(JSON.stringify(evaluations));

      //   // var a = document.createElement("a");
      //   // a.href = "data:" + data;
      //   // a.setAttribute("download", `${sampleName}_evaluations.json`);

      //   // document.body.appendChild(a);
      //   // a.click();
      // });
    },
    downloadFileAttachement(data: any, fileName: string) {
      const fileURL = window.URL.createObjectURL(new Blob([data]));
      const fileLink = document.createElement('a');

      fileLink.href = fileURL;
      fileLink.setAttribute('download', `${fileName}.tsv`);
      document.body.appendChild(fileLink);

      fileLink.click();
    },
  },
});
</script>

<style lang="stylus">
.my-sticky-header-table {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: $grey-1; /* #eeeeee */
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}

.my-sticky-header-table-dark {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: $black-1; /* #eeeeee */
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}

/* for limiting overflow on screen */
.tags-input-root {
  max-width: 140px;
}

.project-image {
  height: 120px;
  box-shadow: 0px 0px 8px rgb(204 204 204);
}
</style>
