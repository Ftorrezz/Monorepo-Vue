<template>
  <q-page>
    <EncabezadoGenericoPrincipal :tituloVentana="'Administración de accesos de usuario'" />
    <q-splitter
      v-model="splitterModel"
      style="height: calc(100vh - 50px)"
      separator-class="bg-primary"
      separator-style="width: 3px"
      class="q-pa-xs q-col-gutter-sm"
    >
      <!-- Árbol de Usuarios -->
      <template v-slot:before>
        <q-card class="my-card" bordered>
          <div class="tree-container">
            <div class="header-section">
              <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
                <q-toolbar-title class="text-h6">Usuario</q-toolbar-title>
                <q-btn flat round dense icon="add">
                  <q-tooltip class="bg-purple text-body2">Agregar nuevo usuario</q-tooltip>
                </q-btn>
              </q-toolbar>
            </div>
            <div class="search-section">
              <q-input
                ref="userFilterRef"
                v-model="userFilter"
                label="Buscar"
                outlined
                dense
                debounce="600"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="userFilter"
                    name="clear"
                    class="cursor-pointer"
                    @click="resetUserFilter"
                  />
                </template>
              </q-input>
            </div>
            <div class="tree-content">
              <q-tree
                :nodes="treeData"
                node-key="id"
                default-expand-all
                :filter="userFilter"
                :filter-method="userFilterMethod"
                @drop="onDrop"
                @dragover="allowDrop"
              >
                <template v-slot:default-header="scope">
                  <q-item
                    class="q-pa-xs"
                    :class="{
                      'user-node': scope.node.type === 'user',
                      'category-node': scope.node.type === 'category',
                      'access-node': !scope.node.type || (scope.node.type !== 'user' && scope.node.type !== 'category'),
                      'draggable': scope.node.type !== 'user'
                    }"
                    :data-id="scope.node.id"
                    :draggable="scope.node.type !== 'user'"
                    @dragstart="onDragStart(scope.node)"
                  >
                    <q-item-section side v-if="scope.node.icon">
                      <q-icon :name="scope.node.icon" />
                    </q-item-section>

                    <q-item-section v-if="scope.node.type !== 'user' && !scope.node.icon" side>
                      <q-btn
                        color="negative"
                        icon="delete"
                        padding="xs"
                        round
                        size="8px"
                        @click.stop="deleteAccess(scope.node)"
                        flat
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ scope.node.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-tree>
            </div>
          </div>
        </q-card>
      </template>

      <template v-slot:separator>
        <q-avatar
          color="primary"
          text-color="white"
          size="40px"
          icon="drag_indicator"
        >
          <q-tooltip class="bg-purple text-body2">
            Mantenga presionado y mueva hacia la izquierda o derecha para
            ampliar rango de visión
          </q-tooltip>
        </q-avatar>
      </template>

      <!-- Paneles de Perfiles, Roles y Accesos -->
      <template v-slot:after>
        <q-card class="my-card" bordered>
          <div class="content-container">
            <!-- Accesos -->
            <div class="row col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div class="q-pa-xs col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <div class="header-section">
                  <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
                    <q-toolbar-title class="text-h6">Accesos</q-toolbar-title>
                    <q-space />
                  </q-toolbar>
                </div>

                <div class="search-section">
                  <q-input
                    ref="accessFilterRef"
                    v-model="accessFilter"
                    label="Buscar"
                    outlined
                    dense
                    debounce="600"
                  >
                    <template v-slot:append>
                      <q-icon
                        v-if="accessFilter"
                        name="clear"
                        class="cursor-pointer"
                        @click="resetAccessFilter"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="scroll-content">
                  <q-list bordered>
                    <!-- Encabezado de la tabla -->
                    <q-item>
                      <q-item-section
                        class="text-bold column-divider"
                        style="flex: 2"
                      >Descripción</q-item-section>
                      <q-item-section
                        class="text-bold column-divider"
                        style="flex: 1"
                      >Identificador</q-item-section>
                      <q-item-section class="text-bold" style="flex: 1"
                      >Tipo de acceso</q-item-section>
                    </q-item>

                    <!-- Iteración sobre los elementos filtrados de accessList -->
                    <q-item
                      v-for="access in filterAccess"
                      :key="access.id"
                      :draggable="true"
                      @dragstart="onDragStart(access, 'access')"
                      class="cursor-pointer"
                    >
                      <!-- Columna para el campo descripción -->
                      <q-item-section style="flex: 2" class="column-divider">{{
                        access.label
                      }}</q-item-section>
                      <!-- Columna para el campo identificador -->
                      <q-item-section style="flex: 1" class="column-divider">{{
                        access.identificador
                      }}</q-item-section>
                      <!-- Columna para el campo tipo de acceso -->
                      <q-item-section style="flex: 1">tipo</q-item-section>
                    </q-item>

                    <!-- Mostrar mensaje si no hay elementos en la lista filtrada -->
                    <q-item v-if="filterAccess.length === 0">
                      <q-item-section class="text-grey text-center" colspan="3"
                      >No hay accesos disponibles</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Perfiles -->
              <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <div class="q-pa-xs">
                  <q-toolbar
                    class="bg-primary text-white shadow-2 rounded-borders"
                  >
                    <q-toolbar-title>Perfiles</q-toolbar-title>
                    <!--<q-btn flat round dense icon="add">
                  <q-tooltip class="bg-purple text-body2"
                    >Agregar nuevo perfil</q-tooltip
                  >
                </q-btn>-->
                  </q-toolbar>
                  <q-list bordered>
                    <q-item
                      v-for="perfil in perfiles"
                      :key="perfil.value"
                      :draggable="true"
                      @dragstart="onDragStart(perfil, 'profile')"
                    >
                      <q-item-section>{{ perfil.label }}</q-item-section>
                      <q-item-section side>
                        <q-btn flat round dense icon="key">
                          <q-tooltip class="bg-purple text-body2"
                            >Ver accesos asignados al perfil
                            {{ perfil.label }}</q-tooltip
                          >
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Roles -->
                <div class="q-pa-xs">
                  <q-toolbar
                    class="bg-primary text-white shadow-2 rounded-borders"
                  >
                    <q-toolbar-title>Roles</q-toolbar-title>
                  </q-toolbar>
                  <q-list bordered>
                    <q-item
                      v-for="rol in roles"
                      :key="rol.value"
                      :draggable="true"
                      @dragstart="onDragStart(rol, 'role')"
                    >
                      <q-item-section>{{ rol.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
            <q-tooltip class="bg-purple text-body2"
              >Seleccione un acceso, perfil o rol y arrastrelo hacia el usuario
              al que se lo desea asignar</q-tooltip
            >
          </div>
        </q-card>
      </template>
    </q-splitter>

    <!-- Diálogo para Editar/Agregar Accesos -->
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Gestionar Acceso</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitForm">
            <q-select
              v-model="form.usuario"
              :options="usuarios"
              label="Usuario"
              clearable
            />
            <q-select
              v-model="form.perfil"
              :options="perfiles"
              label="Perfil"
              clearable
            />
            <q-select
              v-model="form.rol"
              :options="roles"
              label="Rol"
              clearable
            />
            <q-btn type="submit" label="Guardar" color="primary" />
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import NdPeticionControl from "src/controles/rest.control";
import { ref, onMounted, computed } from "vue";
import EncabezadoGenericoPrincipal from "../../components/EncabezadoGenericoPrincipal.vue";

const splitterModel = ref(25);
const treeData = ref([]);
const usuarios = ref([]);
const perfiles = ref([]);
const roles = ref([]);
const accessList = ref([]);
const userFilter = ref("");
const userFilterRef = ref(null);
const accessFilter = ref("");
const accessFilterRef = ref(null);

const obtenerAccessList = async () => {
    try {
        const _peticion = new NdPeticionControl();

        const _respuesta = await _peticion.invocarMetodo("acceso", "get");

        console.log('Respuesta del backend (lista de accesos):', _respuesta);
        
        return _respuesta.map((acceso) => ({
            id: acceso.id,
            label: acceso.descripcion,
            identificador: acceso.identificador,
        }));
    } catch (error) {
        console.error("Error al obtener lista de accesos:", error);
        return [];
    }
};

const userFilterMethod = (node, filter) => {
    const filt = filter.toLowerCase();
    return (
        node.label.toLowerCase().indexOf(filt) > -1 ||
        (node.children && node.children.some((n) => userFilterMethod(n, filter)))
    );
};

const resetUserFilter = () => {
    userFilter.value = "";
};

const resetAccessFilter = () => {
    accessFilter.value = "";
};

const filterAccess = computed(() => {
    if (!accessFilter.value) return accessList.value;
    const filt = accessFilter.value.toLowerCase();
    return accessList.value.filter(
        access => 
            access.label.toLowerCase().includes(filt) ||
            access.identificador.toLowerCase().includes(filt)
    );
});

const form = ref({
    id: null,
    usuario: null,
    perfil: null,
    rol: null,
});
const dialog = ref(false);
const draggedItem = ref(null);

// Función para inicializar los datos
const initializeData = async () => {
    try {
        // Obtener usuarios primero ya que son necesarios para el árbol
        usuarios.value = await fetchUsuarios();
        
        // Obtener perfiles, roles y lista de accesos
        const [perfilesData, rolesData, accessListData] = await Promise.all([
            fetchPerfiles(),
            fetchRoles(),
            obtenerAccessList()
        ]);

        // Asignar los datos a las variables reactivas
        perfiles.value = perfilesData;
        roles.value = rolesData;
        accessList.value = accessListData;

        // Obtener accesos de usuario y formatear el árbol
        const userAccesses = await fetchUserAccesses();
        treeData.value = formatTreeData(userAccesses);
    } catch (error) {
        console.error("Error al inicializar los datos:", error);
    }
};

// Inicializar datos al montar el componente
onMounted(() => {
    initializeData();
});

const fetchUserAccesses = async () => {
    try {
        const _peticion = new NdPeticionControl();
        const _respuesta = await _peticion.invocarMetodo("usuarioacceso", "get");
        
        console.log('Respuesta del backend (accesos de usuario):', _respuesta);
        
        return _respuesta.map(acceso => {
            // Si es un perfil (id_acceso = -1)
            if (acceso.id_acceso === -1) {
                return {
                    id: acceso.id.toString(),
                    usuario: acceso.id_usuario.toString(),
                    perfil: acceso.id_perfil.toString(),
                    rol: null,
                    label: 'Perfil asignado'
                };
            }
            
            // Si es un acceso normal
            const accessInfo = accessList.value.find(a => a.id === acceso.id_acceso);
            return {
                id: acceso.id.toString(),
                usuario: acceso.id_usuario.toString(),
                perfil: null,
                rol: acceso.id_rol ? acceso.id_rol.toString() : null,
                label: accessInfo ? accessInfo.label : 'Acceso sin descripción'
            };
        });
    } catch (error) {
        console.error("Error al obtener accesos de usuario:", error);
        return [];
    }
};

const fetchUsuarios = async () => {
  // Simular una llamada a la API para obtener los usuarios

  try {
    const _peticion = new NdPeticionControl();

    const _respuesta = await _peticion.invocarMetodo("usuario", "get");

    // Aquí suponemos que response.data contiene la lista de usuarios en el nuevo formato
    return _respuesta.map((usuario) => ({
      label: usuario.nombreusuario, // Usar 'nombreusuario' como etiqueta a mostrar
      value: usuario.id.toString(), // Convertir el ID a string si es necesario
      // Puedes agregar más propiedades si son necesarias
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return []; // Manejar el error de manera adecuada en tu aplicación
  }

  /*return [
    { label: "User 1", value: "user1" },
    { label: "User 2", value: "user2" },
    { label: "User 3", value: "user3" },
    // Otros usuarios...
  ];*/
};

const fetchPerfiles = async () => {
  // Simular una llamada a la API para obtener los perfiles

  try {
    const _peticion = new NdPeticionControl();

    const _respuesta = await _peticion.invocarMetodo("perfil", "get");

    console.log('Respuesta del backend (perfiles):', _respuesta);
    
    return _respuesta.map((perfil) => ({
      value: perfil.id.toString(),
      label: perfil.descripcion,
    }));
  } catch (error) {
    console.error("Error al obtener perfiles:", error);
    return [];
  }
};

const fetchRoles = async () => {

  try {
    const _peticion = new NdPeticionControl();

    const _respuesta = await _peticion.invocarMetodo("ndrolusuario", "get");

    console.log('Respuesta del backend (roles):', _respuesta);
    
    return _respuesta.map((rol) => ({
      value: rol.id.toString(),
      label: rol.descripcion,
    }));
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
  /*// Simular una llamada a la API para obtener los roles
  return [
    { label: "Rol 1", value: "rol1" },
    { label: "Rol 2", value: "rol2" },
    { label: "Rol 3", value: "rol3" },
    // Otros roles...
  ];*/
};

const formatTreeData = (userAccesses) => {
    const usersMap = {};

    // Inicializar usuarios
    usuarios.value.forEach((usuario) => {
        usersMap[usuario.value] = {
            id: usuario.value,
            label: usuario.label,
            icon: "person",
            type: "user",
            children: [
                {
                    id: `${usuario.value}-perfiles`,
                    label: "Perfiles",
                    type: "category",
                    icon: "group",
                    children: [],
                },
                {
                    id: `${usuario.value}-roles`,
                    label: "Roles",
                    type: "category",
                    icon: "settings_accessibility",
                    children: [],
                },
                {
                    id: `${usuario.value}-accesos`,
                    label: "Accesos",
                    type: "category",
                    icon: "key",
                    children: [],
                },
            ],
        };
    });

    // Agregar accesos manteniendo la estructura consistente
    if (Array.isArray(userAccesses)) {
        userAccesses.forEach((access) => {
            const userKey = access.usuario;
            const user = usersMap[userKey];
            
            if (!user) return;

            const [profileNode, roleNode, accessNode] = user.children;

            const baseNodeProps = {
                type: "item",
                userId: userKey,
            };

            // Si es un perfil (id_acceso = -1)
            if (access.perfil) {
                const perfil = perfiles.value.find(p => p.value === access.perfil);
                if (perfil) {
                    profileNode.children.push({
                        ...baseNodeProps,
                        id: `${userKey}-perfil-${access.id}`,
                        label: perfil.label,
                        value: access.perfil,
                    });
                }
            }

            // Si tiene rol asignado
            if (access.rol) {
                const rol = roles.value.find(r => r.value === access.rol);
                if (rol) {
                    roleNode.children.push({
                        ...baseNodeProps,
                        id: `${userKey}-rol-${access.id}`,
                        label: rol.label,
                        value: access.rol,
                    });
                }
            }

            // Si es un acceso normal (id_acceso != -1)
            if (!access.perfil) {
                accessNode.children.push({
                    ...baseNodeProps,
                    id: `${userKey}-acceso-${access.id}`,
                    label: access.label,
                    value: access.id,
                });
            }
        });
    }

    return Object.values(usersMap);
};

const createAccess = () => {
  form.value = { id: null, usuario: null, perfil: null, rol: null };
  dialog.value = true;
};

const editAccess = (node) => {
  form.value = { ...node };
  dialog.value = true;
};

const deleteAccess = async (node) => {
    try {
        const _peticion = new NdPeticionControl();
        await _peticion.invocarMetodo("usuarioacceso", "delete", { id: node.id });
        
        // Actualizar UI después de éxito
        const user = treeData.value.find((u) => u.id === node.usuario);
        user.children.forEach((category) => {
            category.children = category.children.filter((item) => item.id !== node.id);
        });
    } catch (error) {
        console.error("Error al eliminar acceso:", error);
        // Mostrar mensaje de error al usuario
    }
};

const submitForm = async () => {
  if (form.value.id) {
    // Simular una llamada a la API para actualizar el acceso
  } else {
    // Simular una llamada a la API para crear un nuevo acceso
    const user = treeData.value.find((u) => u.id === form.value.usuario);
    const category = user.children.find((child) => child.label === "Accesos");
    category.children.push({
      id: `${form.value.usuario}-${form.value.perfil}-${form.value.rol}`,
      label: `Perfil: ${form.value.perfil}, Rol: ${form.value.rol}`,
      type: "access",
      ...form.value,
    });
  }
  dialog.value = false;
};

const onDragStart = (item, type) => {
  draggedItem.value = { ...item, type };
};

const onDrop = async (event) => {
    try {
        event.preventDefault();
        const dropTarget = event.target.closest(".q-item");
        if (!dropTarget) return;

        const userId = dropTarget.dataset.id;
        const user = treeData.value.find((u) => u.id === userId);
        if (!user) return;

        const { id, label, type, value } = draggedItem.value;

        // Verificar la categoría correcta
        const categoryNode = user.children.find(child => {
            switch(type) {
                case 'access': return child.label === "Accesos";
                case 'role': return child.label === "Roles";
                case 'profile': return child.label === "Perfiles";
                default: return false;
            }
        });

        // Evitar duplicados
        if (categoryNode.children.some(item => item.id === `${userId}-${id}`)) {
            return;
        }

        // Crear el objeto con la estructura correcta que espera el backend
        const payload = {
            id_usuario: parseInt(userId),
            id_acceso: type === 'access' ? parseInt(id) : null,
            id_configuracion: 1, // Valor fijo por ahora, más adelante se obtendrá de la sucursal seleccionada
            permitir: 'S' // o el valor que corresponda para tu caso
        };

        // Enviar al backend
        const _peticion = new NdPeticionControl();
        await _peticion.invocarMetodo("usuarioacceso", "post", payload);

        // Actualizar UI
        categoryNode.children.push({
            id: `${userId}-${id}`,
            label: type === 'access' ? label : `${label}`,
            type: type,
        });

        draggedItem.value = null;
    } catch (error) {
        console.error("Error al asignar acceso:", error);
    }
};

const allowDrop = (event) => {
  event.preventDefault();
};
</script>

<style lang="scss" scoped>
// Estilos para las secciones de header y búsqueda
.header-section {
  padding: 8px 16px;
  margin: 0;

  .q-toolbar {
    min-height: 48px;
    height: 48px;
    margin: 0;
    padding: 0 8px;
    display: flex;
    align-items: center;

    .q-toolbar-title {
      font-size: 1.25rem;
      line-height: 1.6;
      padding: 0;
      height: 32px;
      display: flex;
      align-items: center;
    }

    .q-btn {
      margin-left: 8px;
    }
  }
}

.search-section {
  padding: 8px 16px 16px;
  margin: 0;
  display: flex;
  align-items: center;

  .q-input {
    width: 100%;
    margin: 0;

    :deep(.q-field__control) {
      height: 36px;
      padding: 0 8px;
    }

    :deep(.q-field__marginal) {
      height: 36px;
    }
  }
}

.tree-container, .content-container {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.tree-content, .scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

// Ajustar el tamaño máximo de las cards
.my-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;

  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .scroll-content {
    flex: 1;
    overflow-y: auto;
  }
}

// Estilos para el árbol
.q-tree {
  position: relative;
  padding-top: 8px;

  &__node {
    position: relative;
    padding-left: 8px;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 100%;
      border-left: 1px solid #ddd;
    }

    &:last-child:before {
      height: 50%;
    }

    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 8px;
      height: 1px;
      background: #ddd;
    }
  }

  .q-item {
    min-height: 32px;
    padding: 4px;

    &.user-node {
      margin-left: 0;
    }

    &.category-node {
      margin-left: 6px;
    }

    &.access-node {
      margin-left: 12px;
    }
  }
}

// Estilos para elementos arrastrables
.draggable {
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>