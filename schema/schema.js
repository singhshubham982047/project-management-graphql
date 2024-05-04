import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { Client } from "../models/Client.js";
import { Project } from "../models/Project.js";

const ClientType = new GraphQLObjectType({
  name: "Client",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    clientId: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve(parent, args) {
        return Client.findById(parent.clientId);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    clients: {
      type: new GraphQLList(ClientType),
      resolve(parent, args) {
        return Client.find();
      },
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Client.findById(args.id);
      },
    },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve(parent, args) {
        return Project.find();
      },
    },
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Project.findById(args.id);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addClients: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const client = Client.create({
          name: args.name,
          email: args.email,
          phone: args.phone,
        });
        return client;
      },
    },
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        try {
          const projects = await Project.find({ clientId: args.id });
          await Promise.all(projects.map((project) => project.deleteOne()));

          return await Client.findByIdAndDelete(args.id);
        } catch (error) {
          throw new Error(error);
        }
      },
    },

    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatus",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
          defaultValue: "Not Started",
        },
        clientId: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const project = Project.create({
          name: args.name,
          description: args.description,
          status: args.status,
          clientId: args.clientId,
        });
        return project;
      },
    },
    deleteProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Project.findByIdAndDelete(args.id);
      },
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatusUpdate",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
        },
      },
      resolve(parent, args) {
        return Project.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              description: args.description,
              status: args.status,
            },
          },
          { new: true }
        );
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
