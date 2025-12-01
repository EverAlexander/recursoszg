<template>
    <div data-app>
        <!-- Card Principal -->
        <v-card class="p-4 mt-4 elevation-3">
            <v-container>
                <v-row align="center" justify="space-between">
                    <v-col>
                        <h2 class="black-secondary">{{ title }}</h2>
                    </v-col>
                    <v-col class="d-flex justify-end">
                        <base-button type="primary" title="Agregar" @click="addRecord()" />
                    </v-col>
                </v-row>

                <!-- Campo Buscar -->
                <v-row class="mt-3">
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="search" variant="outlined" label="Buscar" clearable dense />
                    </v-col>
                </v-row>
            </v-container>

            <!-- Tabla de Datos -->
            <v-data-table-server :headers="headers" :items-length="total" :items="records" :loading="loading"
                item-title="id_marca" item-value="id_marca" class="mt-4" @update:options="getDataFromApi">
                <!-- Acciones -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon size="20" class="mr-2" @click="editItem(item.raw)" icon="mdi-pencil" />
                    <v-icon size="20" class="mr-2" @click="deleteItem(item.raw)" icon="mdi-delete" />
                </template>

                <!-- Sin datos -->
                <template v-slot:no-data>
                    <v-row justify="center" class="my-4">
                        <v-icon size="36" @click="initialize" icon="mdi-refresh" class="cursor-pointer" />
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <!-- Dialog Formulario -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
            <v-card class="pa-4 rounded-lg elevation-4">
                <!-- Título -->
                <v-card-title class="justify-center">
                    <h2 class="black-secondary text-center">{{ formTitle }}</h2>
                </v-card-title>

                <!-- Contenido del formulario -->
                <v-card-text>
                    <v-container>
                        <v-row dense class="mt-3">
                            <v-col cols="12" sm="12" md="6">
                                <base-input label="Nombre del producto" v-model="v$.editedItem.nombre.$model"
                                    :rules="v$.editedItem.nombre" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="12" md="6">
                                <base-input label="Modelo" v-model="v$.editedItem.modelo.$model"
                                    :rules="v$.editedItem.modelo" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="12" md="6">
                                <base-input label="Descripcion" v-model="v$.editedItem.descripcion.$model"
                                    :rules="v$.editedItem.descripcion" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="12" md="6">
                                <base-select label="Marca" v-model="v$.editedItem.marca.$model" :items="marcas"
                                    item-title="nombre" item-value="id_marca" :rules="v$.editedItem.marca" outlined
                                    dense clearable />
                            </v-col>

                            <!-- ID de Modelo oculto -->
                            <input type="hidden" v-model="v$.editedItem.id_modelo.$model" />
                        </v-row>

                        <!-- Botones centrados -->
                        <v-row class="mt-4">
                            <v-col class="d-flex justify-center flex-wrap">
                                <base-button type="primary" title="Guardar" @click="save" class="mb-2" />
                                <base-button type="secondary" title="Cancelar" @click="close" class="ms-2 mb-2" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog Eliminar -->
        <v-dialog v-model="dialogDelete" max-width="400px">
            <v-card class="pa-4">
                <v-container>
                    <h3 class="black-secondary text-center mb-4">Eliminar registro</h3>
                    <v-row>
                        <v-col class="d-flex justify-center">
                            <base-button type="primary" title="Confirmar" @click="deleteItemConfirm" />
                            <base-button class="ms-2" type="secondary" title="Cancelar" @click="closeDelete" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>




<script>
import { useVuelidate } from "@vuelidate/core";
import { messages } from "@/utils/validators/i18n-validators";
import { helpers, minLength, required, email } from "@vuelidate/validators";

import modelProductApi from "@/services/GameConsole";
//import brandsApi from "@/services/brandsApi";

import BaseButton from "../components/base-components/BaseButton.vue";
import BaseInput from "../components/base-components/BaseInput.vue";
import BaseSelect from "../components/base-components/BaseSelect.vue";
import useAlert from "../composables/useAlert";

const { alert } = useAlert();
const langMessages = messages["es"].validations;

export default {
    components: { BaseButton, BaseInput, BaseSelect },
    setup() {
        return { v$: useVuelidate() };
    },
    data() {
        return {
            selected: [],
            marcas: [],
            dialog: false,
            dialogDelete: false,
            headers: [
                { title: "Serial", key: "numero_serie" },
                { title: "Activo Fijo", key: "activofijo" },
                { title: "Modelo", key: "modelo" },
                { title: "Color", key: "color" },
                { title: "Observacion", key: "observacion" },
                { title: "Estado", key: "estado" },
                { title: "Ubicacion", key: "ubicacion" },
                { title: "Accion", key: "actions", sortable: false, align: 'center' },
            ],
            search: "",
            records: [],
            editedIndex: -1,
            title: "Consola de Video juegos",
            total: 0,
            options: {},
            editedItem: {
                nombre: "",
                descripcion: "",
                modelo: "",
                marca: "",
                id_modelo: "",
            },
            defaultItem: {
                nombre: "",
                descripcion: "",
                modelo: "",
                marca: "",
                id_modelo: "",
            },
            loading: false,
            debounce: 0,
        };
    },

    watch: {
        dialogDelete(val) {
            val || this.closeDelete();
        },

        search() {
            // Reiniciar a página 1 siempre que se busca
            this.options.page = 1;
            this.getDataFromApi(this.options);
        },

        dialog(val) {
            val || this.close();
        },

        dialogBlock(val) {
            val || this.closeBlock();
        },
    },

    // Validations
    validations() {
        return {
            editedItem: {
                nombre: {
                    required,
                    minLength: minLength(1),
                },
                descripcion: {
                    required,
                    minLength: minLength(1),
                },
                modelo: {
                    required,
                    minLength: minLength(1),
                },
                id_modelo: {
                    minLength: minLength(1),
                },
                marca: { required },
            },
        };
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Nuevo registro" : "Editar registro";
        },
    },

    created() {
        this.initialize(); this.getMarcas();

    },

    beforeMount() {
        this.getDataFromApi({ page: 1, itemsPerPage: 10, sortBy: [], search: '' });
    },

    methods: {
        async initialize() {
            this.loading = true;
            this.records = [];

            let requests = [this.getDataFromApi()];

            const responses = await Promise.all(requests).catch((error) => {
                alert.error("No fue posible obtener el registro.");
            });

            if (responses) {
            }

            this.loading = false;
        },

        editItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async save() {
            this.v$.$validate();
            if (this.v$.$invalid) {
                alert.error("Campos obligatorios");
                return;
            }

            // Updating record
            if (this.editedIndex > -1) {
                const edited = Object.assign(
                    this.records[this.editedIndex],
                    this.editedItem
                );

                try {

                    const { data } = await modelProductApi.put(`/update/${edited.id_modelo}`, edited);

                    alert.success(data.message);
                } catch (error) {
                    alert.error("No fue posible actualizar el registro.");
                }

                this.close();
                this.initialize();
                return;
            }

            //Creating record
            try {

                const payload = {
                    nombre: this.editedItem.nombre,
                    descripcion: this.editedItem.descripcion,
                    modelo: this.editedItem.modelo,
                    marca: this.editedItem.marca,
                };
                const { data } = await modelProductApi.post('/store', payload);

                alert.success(data.message);
            } catch (error) {
                alert.error("No fue posible crear el registro.");
            }

            this.close();
            this.initialize();
            return;
        },

        deleteItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);

            this.dialogDelete = true;
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async deleteItemConfirm() {
            try {
                const { data } = await modelProductApi.delete(`/delete/${this.editedItem.id_modelo}`, {
                    params: {
                        id: this.editedItem.id_modelo,
                    },
                });

                alert.success(data.message);
            } catch (error) {
                this.close();
            }

            this.initialize();
            this.closeDelete();
        },


        async getDataFromApi(options) {
            this.loading = true;

            // Si llegan opciones desde la tabla, las guardo    ||
            if (options) {
                this.options = options;
            }

            clearTimeout(this.debounce);
            this.debounce = setTimeout(async () => {
                try {
                    const { data } = await modelProductApi.get("/select", {
                        params: {
                            ...this.options,    // page, itemsPerPage, sortBy
                            search: this.search // buscador
                        },
                    });

                    this.records = data.data;
                    this.total = data.total;
                } catch (error) {
                    alert.error("No fue posible obtener los registros.");
                }

                this.loading = false;
            }, 500);
        },

        async getMarcas() {
            try {
                const { data } = await brandsApi.get('/select'); // endpoint para traer marcas
                if (data.code === 200) {
                    this.marcas = data.data; // array de marcas
                }
            } catch (error) {
                alert.error("No se pudieron cargar las marcas.");
            }
        },

        addRecord() {
            this.getMarcas();
            this.dialog = true;
            this.editedIndex = -1;
            this.editedItem = Object.assign({}, this.defaultItem);
            this.v$.$reset();
        },
    },
};
</script>